<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import '@/styles/rich-text.css'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    ariaLabel?: string
  }>(),
  {
    modelValue: '',
    ariaLabel: '富文本内容',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      blockquote: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
    }),
  ],
  editorProps: {
    attributes: { class: 'tiptap-editor rich-text', 'aria-label': props.ariaLabel },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && val !== editor.value.getHTML()) {
      editor.value.commands.setContent(val ?? '', { emitUpdate: false })
    }
  },
)

// ─── Heading dropdown ─────────────────────────────────────

const showHeadingMenu = ref(false)

const headingOptions = [
  { label: '正文', action: () => editor.value?.chain().focus().setParagraph().run() },
  {
    label: '标题 1',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: '标题 2',
    action: () => editor.value?.chain().focus().toggleHeading({ level: 4 }).run(),
  },
]

const currentHeadingLabel = () => {
  if (editor.value?.isActive('heading', { level: 4 })) return '标题 2'
  if (editor.value?.isActive('heading', { level: 3 })) return '标题 1'
  return '正文'
}

const applyHeading = (option: (typeof headingOptions)[0]) => {
  option.action()
  showHeadingMenu.value = false
}

// ─── Clear formatting ─────────────────────────────────────

const clearFormatting = () => {
  editor.value?.chain().focus().clearNodes().unsetAllMarks().run()
}
</script>

<template>
  <div class="rounded-md border border-input bg-background shadow-sm overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center gap-px border-b px-1.5 py-1 bg-muted/30 flex-wrap">
      <!-- Undo / Redo -->
      <button
        type="button"
        class="tb"
        :disabled="!editor?.can().undo()"
        title="撤销"
        @click="editor?.chain().focus().undo().run()"
      >
        <icon-lucide-undo-2 class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="tb"
        :disabled="!editor?.can().redo()"
        title="重做"
        @click="editor?.chain().focus().redo().run()"
      >
        <icon-lucide-redo-2 class="h-4 w-4" />
      </button>

      <div class="tb-sep" />

      <!-- Heading Dropdown -->
      <div class="relative">
        <button
          type="button"
          class="tb px-2 gap-1 text-xs font-medium min-w-[68px] justify-between"
          @click="showHeadingMenu = !showHeadingMenu"
          @blur="showHeadingMenu = false"
        >
          <span>{{ currentHeadingLabel() }}</span>
          <icon-lucide-chevron-down class="h-3 w-3 opacity-60" />
        </button>
        <div
          v-if="showHeadingMenu"
          class="absolute top-full left-0 mt-0.5 z-50 min-w-[100px] rounded-md border bg-background shadow-md py-1"
        >
          <button
            type="button"
            v-for="opt in headingOptions"
            :key="opt.label"
            class="w-full text-left px-3 py-1.5 text-sm hover:bg-muted/60 transition-colors"
            @mousedown.prevent="applyHeading(opt)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="tb-sep" />

      <!-- Bold -->
      <button
        type="button"
        class="tb font-bold"
        :class="{ 'tb-on': editor?.isActive('bold') }"
        title="粗体"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        B
      </button>

      <div class="tb-sep" />

      <!-- Lists -->
      <button
        type="button"
        class="tb"
        :class="{ 'tb-on': editor?.isActive('bulletList') }"
        title="无序列表"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <icon-lucide-list class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="tb"
        :class="{ 'tb-on': editor?.isActive('orderedList') }"
        title="有序列表"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <icon-lucide-list-ordered class="h-4 w-4" />
      </button>

      <div class="tb-sep" />

      <!-- Clear Formatting -->
      <button type="button" class="tb" title="清除格式" @click="clearFormatting">
        <icon-lucide-remove-formatting class="h-4 w-4" />
      </button>
    </div>

    <!-- Editor Area -->
    <EditorContent :editor="editor" />
  </div>
</template>

<style scoped>
.tb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;
  min-width: 28px;
  padding: 0 4px;
  border-radius: 4px;
  font-size: 0.875rem;
  color: #6b7280;
  transition:
    background-color 0.15s,
    color 0.15s;
  cursor: pointer;
  border: none;
  background: transparent;
}
.tb:hover:not(:disabled) {
  background: rgb(0 0 0 / 0.07);
  color: #111827;
}
.tb:disabled {
  opacity: 0.35;
  pointer-events: none;
}
.tb-on {
  background: rgb(0 0 0 / 0.1);
  color: #111827;
}
.tb-sep {
  width: 1px;
  height: 18px;
  background: #e5e7eb;
  margin: 0 4px;
  flex-shrink: 0;
}
</style>

<style>
.tiptap-editor {
  min-height: 180px;
  padding: 12px 16px;
  outline: none;
}
.tiptap-editor p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #9ca3af;
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
