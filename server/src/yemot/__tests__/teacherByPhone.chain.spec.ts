import teacherByPhoneChain from "../teacherByPhone.chain";

const chain = teacherByPhoneChain;

describe('teacher chain of responsibility', () => {
    let req;
    let res;
    let next;
    const defaultTeacher = {
        id: 'history101',
        name: 'History 101'
    };

    beforeEach(() => {
        // Reset req and res objects before each test
        req = {
            params: {
                phone: undefined,
                teacher: undefined,
            },
            getTeacherByPhone: jest.fn().mockResolvedValue(defaultTeacher),
        };
        res = {
            send: jest.fn(() => Promise.resolve()),
            getText: jest.fn(key => key),
            hangup: jest.fn().mockReturnValue('hangup'),
        };
        next = jest.fn(() => Promise.resolve());
    });

    test('teacher is defined, should early exit chain', async () => {
        req.params.teacher = defaultTeacher;

        await chain.handleRequest(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    test('teacher is not defined and no teahcer found, should return error message', async () => {
        req.getTeacherByPhone = jest.fn().mockReturnValue(null);

        await chain.handleRequest(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.send).toBeCalledWith('phoneIsNotRecognizedInTheSystem');
        expect(res.send).toBeCalledWith('hangup');
    });

    test('teacher is not defined & fetched by phone, should end chain', async () => {
        await chain.handleRequest(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.getTeacherByPhone).toHaveBeenCalled();
        expect(req.params.teacher).toEqual(defaultTeacher);
    });
});