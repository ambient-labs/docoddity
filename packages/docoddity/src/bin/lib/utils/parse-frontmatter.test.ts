import { parseFrontmatter } from "./parse-frontmatter.js";

describe('parseFrontmatter', () => {
  test('it should parse frontmatter', () => {
    const content = [
      '---',
      'title: Hello World',
      'foo: bar',
      '---',
      '# Something',
      'I am content!',
    ].join('\n');

    expect(parseFrontmatter(content)).toEqual({
      title: 'Hello World',
      foo: 'bar',
    });
  });

  test('it should parse nothing if no frontmatter is provided', () => {
    const content = [
      '# Something',
      'I am content!',
    ].join('\n');

    expect(parseFrontmatter(content)).toEqual({});
  });

  test('it should parse nested frontmatter', () => {
    const content = [
      '---',
      'title: Hello World',
      'foo: bar',
      'nested:',
      '  bar: baz',
      '  qux: quux',
      '---',
      '# Something',
      'I am content!',
    ].join('\n');

    expect(parseFrontmatter(content)).toEqual({
      title: 'Hello World',
      foo: 'bar',
      nested: {
        bar: 'baz',
        qux: 'quux',
      },
    });
  });
});
