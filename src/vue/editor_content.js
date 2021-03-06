// https://github.com/ueberdosis/tiptap/blob/main/packages/vue-3/src/EditorContent.ts
import {
  h,
  ref,
  unref,
  Teleport,
  defineComponent,
  watchEffect,
  nextTick,
  onBeforeUnmount,
  getCurrentInstance
} from 'vue';

export const EditorContent = defineComponent({
  name: 'EditorContent',
  props: {
    editor: { type: Object, required: true }
  },
  setup(props) {
    const rootEl = ref();
    const instance = getCurrentInstance();

    watchEffect(() => {
      const editor = props.editor;

      if (editor && editor.options.element && rootEl.value) {
        nextTick(() => {
          if (!rootEl.value || !editor.options.element.firstChild) {
            return;
          }

          const element = unref(rootEl.value);

          rootEl.value.appendChild(editor.options.element.firstChild);

          editor.contentComponent = instance.ctx._;

          editor.setOptions({ element });

          editor.createNodeViews();
        });
      }
    });

    onBeforeUnmount(() => {
      const editor = props.editor;

      // destroy nodeviews before vue removes dom element
      if (!editor.isDestroyed) {
        editor.view.setProps({
          nodeViews: {}
        });
      }

      editor.contentComponent = null;

      if (!editor.options.element.firstChild) {
        return;
      }

      const newElement = document.createElement('div');

      newElement.appendChild(editor.options.element.firstChild);

      editor.setOptions({
        element: newElement
      });
    });

    return { rootEl };
  },

  render() {
    const vueRenderers = [];

    if (this.editor) {
      this.editor.vueRenderers.forEach(vueRenderer => {
        const node = h(
          Teleport,
          {
            to: vueRenderer.teleportElement,
            key: vueRenderer.id
          },
          h(
            vueRenderer.component,
            {
              ref: vueRenderer.id,
              ...vueRenderer.props
            }
          )
        );

        vueRenderers.push(node);
      });
    }

    return h(
      'div',
      {
        ref: (el) => { this.rootEl = el; }
      },
      ...vueRenderers
    );
  }
});
