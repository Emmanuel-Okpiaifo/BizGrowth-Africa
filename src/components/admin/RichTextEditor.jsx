import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadImage, validateImageUrl } from '../../utils/imageUpload';
import { Link2, Image as ImageIcon } from 'lucide-react';

/**
 * Rich Text Editor with Image Upload Support
 * Uses Tiptap (React 19 compatible)
 */
export default function RichTextEditor({ value = '', onChange, placeholder = "Enter content...", type = 'general' }) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Image.configure({
				inline: true,
				allowBase64: false,
			}),
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] px-4 py-3 text-gray-900 dark:text-gray-100',
			},
		},
	});

	// Update editor content when value prop changes
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	// Handle image upload
	const handleImageUpload = async () => {
		const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/jpeg,image/jpg,image/png,image/webp');
		input.click();

		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file || !editor) return;

			try {
				const imageUrl = await uploadImage(file, type);
				editor.chain().focus().setImage({ src: imageUrl }).run();
			} catch (error) {
				alert(`Image upload failed: ${error.message}`);
			}
		};
	};

	// Handle image URL
	const handleImageUrl = async () => {
		const url = prompt('Enter image URL:');
		if (!url || !editor) return;

		const isValid = await validateImageUrl(url);
		if (isValid) {
			editor.chain().focus().setImage({ src: url }).run();
		} else {
			alert('Invalid image URL. Please enter a valid image URL.');
		}
	};

	if (!editor) {
		return (
			<div>
				<textarea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] px-4 py-3 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
					rows={10}
				/>
				<p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
					Loading editor...
				</p>
			</div>
		);
	}

	return (
		<div className="rich-text-editor">
			{/* Toolbar */}
			<div className="mb-2 flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2">
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={`px-2 py-1 rounded text-sm font-semibold transition ${
						editor.isActive('bold')
							? 'bg-primary text-white'
							: 'bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
					}`}
				>
					B
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={`px-2 py-1 rounded text-sm font-semibold italic transition ${
						editor.isActive('italic')
							? 'bg-primary text-white'
							: 'bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
					}`}
				>
					I
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
					className={`px-2 py-1 rounded text-sm font-semibold transition ${
						editor.isActive('heading', { level: 2 })
							? 'bg-primary text-white'
							: 'bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
					}`}
				>
					H2
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={`px-2 py-1 rounded text-sm font-semibold transition ${
						editor.isActive('bulletList')
							? 'bg-primary text-white'
							: 'bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
					}`}
				>
					•
				</button>
				<button
					type="button"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={`px-2 py-1 rounded text-sm font-semibold transition ${
						editor.isActive('orderedList')
							? 'bg-primary text-white'
							: 'bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
					}`}
				>
					1.
				</button>
				<div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
				<button
					type="button"
					onClick={handleImageUpload}
					className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
				>
					<ImageIcon size={14} />
					Upload
				</button>
				<button
					type="button"
					onClick={handleImageUrl}
					className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium bg-white dark:bg-[#0B1220] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
				>
					<Link2 size={14} />
					Image URL
				</button>
			</div>

			{/* Editor */}
			<div className="rounded-b-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0B1220] min-h-[300px]">
				<EditorContent editor={editor} />
			</div>

			<style>{`
				.rich-text-editor .ProseMirror {
					outline: none;
					min-height: 300px;
					padding: 1rem;
				}
				.rich-text-editor .ProseMirror p.is-editor-empty:first-child::before {
					content: attr(data-placeholder);
					float: left;
					color: #9ca3af;
					pointer-events: none;
					height: 0;
				}
				.rich-text-editor .ProseMirror img {
					max-width: 100%;
					height: auto;
					margin: 1rem 0;
				}
				.rich-text-editor .ProseMirror ul,
				.rich-text-editor .ProseMirror ol {
					padding-left: 1.5rem;
					margin: 0.5rem 0;
				}
				.rich-text-editor .ProseMirror h2 {
					font-size: 1.5rem;
					font-weight: bold;
					margin: 1rem 0;
				}
			`}</style>
		</div>
	);
}
