
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    enableCodeActions?: boolean;
    CodeActionsComponent?: React.FC<{ content: string, language?: string }>;
}

const MarkdownRenderer = ({ 
    content, 
    className,
    enableCodeActions = false,
    CodeActionsComponent
}: MarkdownRendererProps) => {
    return (
        <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-bold mb-2 mt-4 first:mt-0">
                            {children}
                        </h3>
                    ),
                    p: ({ children }) => (
                        <ul className="mb-3 last:mb-0 leading-normal">
                            {children}
                        </ul>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc ml-4 mb-3 last:mb-0">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal ml-4 mb-3 last:mb-0">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="mb-1 last:mb-0">
                            {children}
                        </li>
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : '';
                        const codeContent = String(children).replace(/\n$/, '');
                        
                        if (inline) {
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }
                        
                        return (
                            <div className="relative my-4 rounded-md overflow-hidden">
                                <SyntaxHighlighter
                                    language={language || 'text'}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                    }}
                                    wrapLines={true}
                                    showLineNumbers={language !== 'text'}
                                >
                                    {codeContent}
                                </SyntaxHighlighter>
                                {enableCodeActions && CodeActionsComponent && (
                                    <CodeActionsComponent 
                                        content={codeContent} 
                                        language={language}
                                    />
                                )}
                            </div>
                        );
                    },
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-muted-foreground/20 pl-4 italic mb-3 last:mb-0">
                            {children}
                        </blockquote>
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline underline-offset-4 hover:text-primary/80"
                        >
                            {children}
                        </a>
                    ),
                    img: ({ src, alt }) => (
                        <img
                            src={src}
                            alt={alt}
                            className="rounded-lg max-w-full h-auto my-2"
                        />
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-3 last:mb-0">
                            <table className="min-w-full divide-y divide-border">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="px-3 py-2 text-left text-sm font-medium bg-muted">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-3 py-2 text-sm">
                            {children}
                        </td>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer; 