import { addToShikiCache } from '../extensions';

export default function insertReply({ id, type, userId, text, url }) {
  return (state, dispatch) => {
    addToShikiCache(type, id, { id, text, userId, url }, true);

    const { $from, $to } = state.selection;
    const from = $from.pos;
    const to = $to.pos;

    const linkInlineMark = state.schema.marks.link_inline.create({
      id,
      type,
      userId,
      text,
      url,
      meta: { isMention: true }
    }, null, []);
    const textFragment = state.schema.text(text, linkInlineMark);

    dispatch(
      state.tr
        .replaceWith(from, to, textFragment)
        .replaceWith(
          to + textFragment.nodeSize,
          to + textFragment.nodeSize,
          state.schema.text(', ')
        )
        .scrollIntoView()
    );
  };
}
