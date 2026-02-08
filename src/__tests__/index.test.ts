import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logAuthEvent, logSystemEvent, FirestoreLike } from '../index';

describe('sabi-logger', () => {
    let mockAdd: ReturnType<typeof vi.fn>;
    let mockDb: FirestoreLike;

    beforeEach(() => {
        mockAdd = vi.fn().mockResolvedValue({ id: 'mock-id' });
        mockDb = {
            collection: vi.fn().mockReturnValue({
                add: mockAdd,
            }),
        };
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

            await logAuthEvent(mockDb, params);

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

            await expect(logAuthEvent(mockDb, params)).resolves.not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(
                '[sabi-logger] Failed to log auth event:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('logSystemEvent', () => {
        it('should log a system event to "sabi_audit_logs"', async () => {
            await logSystemEvent(mockDb, 'test-app', 'Webhook Received', 'INFO');

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

            await expect(logSystemEvent(mockDb, 'app', 'msg', 'ERROR')).resolves.not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith(
                '[sabi-logger] Failed to log system event:',
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });
});
