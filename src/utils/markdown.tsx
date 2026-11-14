import { createMarkdownIt, type RenderRules } from '@ronradtke/react-native-markdown-display';
import { Text } from 'react-native';

export const markdownParser = createMarkdownIt({ typographer: true });
markdownParser.set({ html: false, linkify: false });
markdownParser.renderer.rules.image = (tokens, index) =>
  markdownParser.utils.escapeHtml(tokens[index].content);

export const markdownRules: RenderRules = {
  image: (node, _children, _parents, styles) => (
    <Text key={node.key} style={styles.text}>
      {node.attributes.alt ?? ''}
    </Text>
  ),
};

export function markdownToHtml(markdown: string): string {
  return markdownParser.render(markdown);
}
