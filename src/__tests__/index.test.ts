import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { logAuthEvent, logSystemEvent, verifyLoggerConnectivity } from '../index';
import * as firebaseMod from '../firebase';

// Mock the firebase module
vi.mock('../firebase', () => ({
    getDb: vi.fn(),
}));

describe('sabi-logger', () => {
    let mockAdd: Mock;
    let mockSet: Mock;
    let mockDelete: Mock;
    let mockDoc: Mock;
    let mockCollection: Mock;

    // Create a mock DB object structure
    const mockDb = {
        collection: vi.fn(),
    };

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Setup Firestore mocks
        mockAdd = vi.fn().mockResolvedValue({ id: 'mock-id' });
        mockSet = vi.fn().mockResolvedValue({});
        mockDelete = vi.fn().mockResolvedValue({});

        mockDoc = vi.fn().mockReturnValue({
            set: mockSet,
            delete: mockDelete,
        });

        mockCollection = vi.fn().mockReturnValue({
            add: mockAdd,
            doc: mockDoc,
        });

        mockDb.collection = mockCollection;

        // Setup getDb to return our mockDb
        (firebaseMod.getDb as Mock).mockReturnValue(mockDb);

        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-02-08T12:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('logAuthEvent', () => {
        it('should log an authentication event to "sabi_audit_logs"', async () => {
            const params = {
                uid: 'user_123',
                appId: 'test-app',
                eventType: 'LOGIN',
                metadata: { ip: '127.0.0.1' },
            };

            await logAuthEvent(params);

            expect(firebaseMod.getDb).toHaveBeenCalled();
            expect(mockDb.collection).toHaveBeenCalledWith('sabi_audit_logs');
            expect(mockAdd).toHaveBeenCalledWith({
                uid: 'user_123',
                appId: 'test-app',
                eventType: 'LOGIN',
                timestamp: '2026-02-08T12:00:00.000Z',
                metadata: { ip: '127.0.0.1' },
            });
        });

        it('should handle errors gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockAdd.mockRejectedValueOnce(new Error('Firestore error'));

            const params = {
                uid: 'user_123',
                appId: 'test-app',
                eventType: 'Login_Failed',
            };

            await expect(logAuthEvent(params)).resolves.not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(
                '[sabi-logger] Failed to log auth event:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('logSystemEvent', () => {
        it('should log a system event to "sabi_audit_logs"', async () => {
            await logSystemEvent('test-app', 'Webhook Received', 'INFO');

            expect(firebaseMod.getDb).toHaveBeenCalled();
            expect(mockDb.collection).toHaveBeenCalledWith('sabi_audit_logs');
            expect(mockAdd).toHaveBeenCalledWith({
                appId: 'test-app',
                timestamp: '2026-02-08T12:00:00.000Z',
                message: 'Webhook Received',
                level: 'INFO',
            });
        });

        it('should handle errors gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockAdd.mockRejectedValueOnce(new Error('Firestore error'));

            await expect(logSystemEvent('app', 'msg', 'ERROR')).resolves.not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(
                '[sabi-logger] Failed to log system event:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('verifyLoggerConnectivity', () => {
        it('should verify connectivity by writing and deleting a test doc', async () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const result = await verifyLoggerConnectivity('test-app');

            expect(result).toBe(true);
            expect(mockDb.collection).toHaveBeenCalledWith('sabi_audit_logs');
            // The doc ID contains a timestamp, so we check string containing
            expect(mockDoc).toHaveBeenCalledWith(expect.stringContaining('connection_test_'));
            expect(mockSet).toHaveBeenCalledWith({
                timestamp: '2026-02-08T12:00:00.000Z',
                eventType: 'CONNECTION_TEST',
                appId: 'test-app',
                message: 'Self-test diagnostic log'
            });
            expect(mockDelete).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should throw error if connectivity check fails', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockSet.mockRejectedValueOnce(new Error('Connection failed'));

            await expect(verifyLoggerConnectivity('test-app')).rejects.toThrow('Connection failed');

            expect(consoleSpy).toHaveBeenCalledWith(
                '❌ [Sabi-Logger] Connectivity FAILED:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });
});
