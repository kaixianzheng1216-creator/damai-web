<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import History from '@tiptap/extension-history'
import { Button } from '@/components/common/ui/button'
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
    Document,
    Paragraph,
    Text,
    Bold,
    Heading,
    BulletList,
    OrderedList,
    ListItem,
    History,
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
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :disabled="!editor?.can().undo()"
        title="撤销"
        @click="editor?.chain().focus().undo().run()"
      >
        <icon-lucide-undo-2 class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :disabled="!editor?.can().redo()"
        title="重做"
        @click="editor?.chain().focus().redo().run()"
      >
        <icon-lucide-redo-2 class="h-4 w-4" />
      </Button>

      <div class="w-px h-[18px] bg-border mx-1 shrink-0" />

      <!-- Heading Dropdown -->
      <div class="relative">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-7 gap-1 px-2 text-xs font-medium min-w-[68px] justify-between"
          @click="showHeadingMenu = !showHeadingMenu"
          @blur="showHeadingMenu = false"
        >
          <span>{{ currentHeadingLabel() }}</span>
          <icon-lucide-chevron-down class="h-3 w-3 opacity-60" />
        </Button>
        <div
          v-if="showHeadingMenu"
          class="absolute top-full left-0 mt-0.5 z-50 min-w-[100px] rounded-md border bg-background shadow-md py-1"
        >
          <Button
            v-for="opt in headingOptions"
            :key="opt.label"
            type="button"
            variant="ghost"
            class="w-full justify-start px-3 py-1.5 text-sm font-normal h-auto"
            @mousedown.prevent="applyHeading(opt)"
          >
            {{ opt.label }}
          </Button>
        </div>
      </div>

      <div class="w-px h-[18px] bg-border mx-1 shrink-0" />

      <!-- Bold -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7 font-bold"
        :class="{ 'bg-accent text-accent-foreground': editor?.isActive('bold') }"
        title="粗体"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        B
      </Button>

      <div class="w-px h-[18px] bg-border mx-1 shrink-0" />

      <!-- Lists -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-accent text-accent-foreground': editor?.isActive('bulletList') }"
        title="无序列表"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <icon-lucide-list class="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        :class="{ 'bg-accent text-accent-foreground': editor?.isActive('orderedList') }"
        title="有序列表"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <icon-lucide-list-ordered class="h-4 w-4" />
      </Button>

      <div class="w-px h-[18px] bg-border mx-1 shrink-0" />

      <!-- Clear Formatting -->
      <Button
        type="button"
        variant="ghost"
        size="icon"
        class="h-7 w-7"
        title="清除格式"
        @click="clearFormatting"
      >
        <icon-lucide-remove-formatting class="h-4 w-4" />
      </Button>
    </div>

    <!-- Editor Area -->
    <EditorContent :editor="editor" />
  </div>
</template>

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
