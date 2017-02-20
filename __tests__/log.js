import log from '../src/log';

describe('Log', () => {
  const stdout = process.stdout.write;
  const stderr = process.stderr.write;

  beforeAll(() => {
    process.stdout.write = jest.fn();
    process.stderr.write = jest.fn();
  });

  afterAll(() => {
    process.stdout.write = stdout;
    process.stderr.write = stderr;
  });

  log.labels.forEach((label) => {
    const level = 'error';

    describe(label, () => {
      it('should log something', () => {
        const str = 'foo';

        log[label][level](str);

        expect(process.stdout.write).not.toHaveBeenCalled();

        const msg = JSON.parse(process.stderr.write.mock.calls.pop());

        expect(msg).toBeInstanceOf(Object);
        expect(msg.level).toBe(level);
        expect(msg.message).toBe(str);
        expect(msg.label).toBe(label);
        expect(msg.timestamp).toBeDefined();
      });
    });
  });
});
