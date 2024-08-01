const { getAvailableSlots } = require('../utils.js');

describe('getAvailableSlots', () => {
    const mockSchedule = {
        '2023-07-23': {
            slots: ['08:00', '08:30', '09:00', '09:30', '10:00'],
            status: [0, 1, 0, 0, 0], // '08:30 - 9:00' slot is booked
        },
    };
    const serviceDuration = 1; // 1 hour

    test('should return available slots correctly', () => {
        const availableSlots = getAvailableSlots(mockSchedule, serviceDuration, {});
        expect(availableSlots).toEqual([
            { date: '2023-07-23', time: '09:00', status: 0, popularity: 0 },
        ]);
    });

    test('should return empty array if no slots available', () => {
        const mockSchedule = {
            '2023-07-23': {
                slots: ['08:00', '08:30'],
                status: [1, 1], // All slots booked
            },
        };
        const availableSlots = getAvailableSlots(mockSchedule, serviceDuration, {});
        expect(availableSlots).toEqual([]);
    });

    test('should handle edge case of partial slot booking', () => {
        const mockSchedule = {
            '2023-07-23': {
                slots: ['08:00', '08:30', '09:00', '09:30'],
                status: [0, 1, 0, 1], // Mixed booked and available
            },
        };
        const availableSlots = getAvailableSlots(mockSchedule, serviceDuration, {});
        expect(availableSlots).toEqual([]);
    });
});
