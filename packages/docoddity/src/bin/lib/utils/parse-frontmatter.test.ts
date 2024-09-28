import { parseFrontmatter } from "./parse-frontmatter.js";

describe('parseFrontmatter', () => {
  test('it should handle empty input', async () => {
    expect(await parseFrontmatter()).toEqual({
    });
  });

  test('it should parse frontmatter', async () => {
    const content = [
      '---',
      'title: Hello World',
      'foo: bar',
      '---',
      '# Something',
      'I am content!',
    ].join('\n');

    expect(await parseFrontmatter(content)).toEqual({
      title: 'Hello World',
      foo: 'bar',
    });
  });

  test('it should parse nothing if no frontmatter is provided', async () => {
    const content = [
      '# Something',
      'I am content!',
    ].join('\n');

    expect(await parseFrontmatter(content)).toEqual({});
  });

  // test('it should parse nested frontmatter', async () => {
  //   const content = [
  //     '---',
  //     'title: Hello World',
  //     'foo: bar',
  //     'nested:',
  //     '  bar: baz',
  //     '  qux: quux',
  //     '---',
  //     '# Something',
  //     'I am content!',
  //   ].join('\n');

  //   expect(await parseFrontmatter(content)).toEqual({
  //     title: 'Hello World',
  //     foo: 'bar',
  //     nested: {
  //       bar: 'baz',
  //       qux: 'quux',
  //     },
  //   });
  // });
});
