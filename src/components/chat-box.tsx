"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpIcon, CheckIcon, CopyIcon, EyeIcon, XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { chat } from "@/actions/chat";
import { readStreamableValue } from "ai/rsc";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./markdown-renderer";

const SYSTEM_PROMPT = "You are an expert HTML CSS , javascript developer specializing in creating landing pages.When the user asks for a landing page, you will generate complete, well-structured HTML  ,CSS and js code in single file. Guidelines for your responses: 1. Always include all HTML, CSS  and javascript in a single file (inline CSS in the <style> tag and js in <script> tag) 2. Use modern HTML5 and CSS3 features 3. Ensure the design is responsive and mobile-friendly 4. Include appropriate semantic HTML tags 5. Optimize for accessibility 6. Use clean, maintainable code with comments 7. Focus on creating visually appealing landing pages8. Include placeholder content that makes sense for the requested page type 9. Do not use external libraries or frameworks unless specifically requested. 10 strictly dont give any other text other than code ."
const prompts = [
    { text: "A simple login form with username and password fields" },
    { text: "A responsive navbar with a dropdown menu" },
    { text: "A card component with an image and title" },
    { text: "A modern footer with social media links" },
];

export type Message = {
    role: "user" | "assistant";
    content: string;
}

function CodeActions({ content, language }: { content: string, language?: string }) {
    const [copied, setCopied] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };
    
    const togglePreview = () => {
        setShowPreview(!showPreview);
    };
    
    // Only show preview button for HTML content
    const isPreviewable = language === 'html' || content.includes('<!DOCTYPE html>') || content.includes('<html');
    
    return (
        <>
            <div className="absolute top-2 right-2 flex space-x-2">
                <button
                    onClick={handleCopy}
                    className="px-2 py-1 rounded-md bg-secondary/80 hover:bg-secondary transition-colors flex items-center gap-1.5 text-xs border border-border/40"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <>
                            <CheckIcon size={14} className="text-green-500" />
                            <span className="text-green-500 font-medium">Copied!</span>
                        </>
                    ) : (
                        <>
                            <CopyIcon size={14} className="text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">Copy code</span>
                        </>
                    )}
                </button>
                
                {isPreviewable && (
                    <button
                        onClick={togglePreview}
                        className="px-2 py-1 rounded-md bg-secondary/80 hover:bg-secondary transition-colors flex items-center gap-1.5 text-xs border border-border/40"
                        aria-label="Preview code"
                    >
                        <EyeIcon size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Preview</span>
                    </button>
                )}
            </div>
            
            {showPreview && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card border rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-semibold">HTML Preview</h3>
                            <button 
                                onClick={togglePreview}
                                className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            >
                                <XIcon size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden p-1">
                            <iframe
                                srcDoc={content}
                                title="Code Preview"
                                className="w-full h-full rounded border bg-white"
                                sandbox="allow-scripts"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const Chatbot = () => {

    const messageEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasStartedChat, setHasStartedChat] = useState<boolean>(false);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [input]);

    const handlePromptClick = (text: string) => {
        setInput(text);
        if (inputRef.current) {
            inputRef.current.textContent = text;
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMesage: Message = {
            role: "user",
            content: SYSTEM_PROMPT + input.trim(),
        };
        const modifyUserMesage: Message = {
            role: "user",
            content:input.trim() ,
        };
        setInput("");
        setIsLoading(true);
        setConversation(prev => [...prev, modifyUserMesage]);
        setHasStartedChat(true);

        try {
            const { newMessage } = await chat([
                ...conversation,
                userMesage ,
            ]);

            let textContent = "";

            const assistantMessage: Message = {
                role: "assistant",
                content: "",
            };

            setConversation(prev => [...prev, assistantMessage]);

            for await (const delta of readStreamableValue(newMessage)) {
                textContent += delta;
                setConversation(prev => {
                    const newConv = [...prev];
                    newConv[newConv.length - 1] = {
                        role: "assistant",
                        content: textContent ,
                    };
                    return newConv;
                });
            }

        } catch (error) {
            console.error("Error: ", error);
            setConversation(prev => [...prev, {
                role: "assistant",
                content: "Sorry, there was an error. Please try again",
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <div className="relative h-full flex flex-col items-center">
            {/* Message Container */}
            <div className="flex-1 w-full max-w-3xl px-4">
                {!hasStartedChat ? (
                    <div className="flex flex-col justify-end h-full space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-semibold">
                                Hi there 👋
                            </h1>
                            <h2 className="text-xl text-muted-foreground">
                                What can I help you with?
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
                            <AnimatePresence>
                                {prompts.map((prompt, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.25 }}
                                        onClick={() => handlePromptClick(prompt.text)}
                                        className="flex items-center gap-3 p-4 text-left border rounded-xl hover:bg-muted transition-all text-sm"
                                    >
                                        {prompt.icon}
                                        <span>
                                            {prompt.text }
                                        </span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        animate={{
                            paddingBottom: input ? (input.split("\n").length > 3 ? "206px" : "110px") : "80px"
                        }}
                        transition={{ duration: 0.2 }}
                        className="pt-8 space-y-4"
                    >
                        {conversation.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex",
                                    {
                                        "justify-end": message.role === "user",
                                        "justify-start": message.role === "assistant"
                                    }
                                )}
                            >
                                <div className={cn(
                                    "max-w-[80%] rounded-xl px-4 py-2",
                                    {
                                        "bg-foreground text-background": message.role === "user",
                                        "bg-muted": message.role === "assistant",
                                    }
                                )}>
                                    {message.role === "assistant" ? (
                                        <MarkdownRenderer 
                                            content={message.content} 
                                            className=""
                                            enableCodeActions={true}
                                            CodeActionsComponent={CodeActions}
                                        />
                                    ) : (
                                        <p className="whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messageEndRef} />
                    </motion.div>
                )}
            </div>

            {/* Input Container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, position: hasStartedChat ? "fixed" : "relative" }}
                className="w-full bg-gradient-to-t from-background via-background to-transparent pb-4 pt-6 bottom-0 mt-auto"
            >
                <div className="max-w-3xl mx-auto px-4">
                    <motion.div
                        animate={{ height: "auto" }}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="relative border rounded-2xl lg:rounded-e-3xl p-2.5 flex items-end gap-2 bg-background"
                    >
                        <div
                            contentEditable
                            role="textbox"
                            onInput={(e) => {
                                setInput(e.currentTarget.textContent || "");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            data-placeholder="Message..."
                            className="flex-1 min-h-[36px] overflow-y-auto px-3 py-2 focus:outline-none text-sm bg-background rounded-md empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] whitespace-pre-wrap break-words"
                            ref={(element) => {
                                inputRef.current = element;
                                if (element && !input) {
                                    element.textContent = "";
                                }
                            }}
                        />

                        <Button
                            size="icon"
                            className="rounded-full shrink-0 mb-0.5"
                            onClick={handleSend}
                        >
                            <ArrowUpIcon strokeWidth={2.5} className="size-5" />
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
        </>
    )
};

export default Chatbot

