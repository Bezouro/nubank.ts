import { parseWwwAuthHeader } from '../../src/utils/utils';

class ITestInterface {
  test: string;
  testCamelCase: string;
}

const MOCKED_NU_WWW_AUTHENTICATE_HEADER = 'test="something", test-camel case="something"';

describe('parseWwwAuthHeader', () => {
  it('should parse a valid header', () => {
    const parsed = parseWwwAuthHeader<ITestInterface>(MOCKED_NU_WWW_AUTHENTICATE_HEADER);
    expect(parsed).toHaveProperty('test', 'something');
    expect(parsed).toHaveProperty('testCamelCase', 'something');
  });
});
