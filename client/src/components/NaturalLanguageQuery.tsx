"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import {
  Send,
  Loader2,
  ShieldCheck,
  Copy,
  Pencil,
  LinkIcon,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  thinking?: boolean;
}

interface CodeBlock {
  language: string;
  code: string;
}
interface Recommendation {
  id: string;
  text: string;
  category: string;
}

export default function NaturalLanguageQueryChat() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const suggestionsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, messagesEndRef]);

  // Fetch recommendations on component mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  // Check scroll position for arrows
  const checkScrollPosition = () => {
    if (suggestionsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        suggestionsScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollContainer = suggestionsScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      return () =>
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
    }
  }, [recommendations]);

  const scrollSuggestions = (direction: "left" | "right") => {
    if (suggestionsScrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? suggestionsScrollRef.current.scrollLeft - scrollAmount
          : suggestionsScrollRef.current.scrollLeft + scrollAmount;

      suggestionsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const fetchRecommendations = async () => {
    try {

      // // Replace with your actual recommendations endpoint
      // const response = await axios.get("http://localhost:3000/recommendations");
      // setRecommendations(response.data);
      setRecommendations([
        {
          id: "1",
          text: "What is CSRF and how to prevent it?",
          category: "Security",
        },
        {
          id: "2",
          text: "How to prevent SQL injection in web applications?",
          category: "Security",
        },
        {
          id: "3",
          text: "Best practices for storing API keys securely",
          category: "Security",
        },
        {
          id: "4",
          text: "How to implement secure authentication?",
          category: "Security",
        },
        {
          id: "5",
          text: "What is XSS and how to mitigate it?",
          category: "Security",
        },
        {
          id: "6",
          text: "How to securely handle user sessions?",
          category: "Security",
        },
        {
          id: "7",
          text: "What is HTTPS and why is it important?",
          category: "Security",
        },
        {
          id: "8",
          text: "How to encrypt sensitive data in storage?",
          category: "Security",
        },
        { id: "9", text: "How to secure REST APIs?", category: "Security" },
        {
          id: "10",
          text: "What is JWT and how to use it securely?",
          category: "Security",
        },
        {
          id: "11",
          text: "How to prevent brute-force login attacks?",
          category: "Security",
        },
        {
          id: "12",
          text: "How to use Content Security Policy (CSP)?",
          category: "Security",
        },
        {
          id: "13",
          text: "How to validate user input effectively?",
          category: "Security",
        },
        {
          id: "14",
          text: "Best practices for OAuth2 implementation",
          category: "Security",
        },
        {
          id: "15",
          text: "How to protect against clickjacking?",
          category: "Security",
        },
      ]);
    } catch (error) {
      // Fallback recommendations if API fails
      setRecommendations([
        {
          id: "1",
          text: "What is CSRF and how to prevent it?",
          category: "Security",
        },
        {
          id: "2",
          text: "How to prevent SQL injection in web applications?",
          category: "Security",
        },
        {
          id: "3",
          text: "Best practices for storing API keys securely",
          category: "Security",
        },
        {
          id: "4",
          text: "How to implement secure authentication?",
          category: "Security",
        },
        {
          id: "5",
          text: "What is XSS and how to mitigate it?",
          category: "Security",
        },
        {
          id: "6",
          text: "How to securely handle user sessions?",
          category: "Security",
        },
        {
          id: "7",
          text: "What is HTTPS and why is it important?",
          category: "Security",
        },
        {
          id: "8",
          text: "How to encrypt sensitive data in storage?",
          category: "Security",
        },
        { id: "9", text: "How to secure REST APIs?", category: "Security" },
        {
          id: "10",
          text: "What is JWT and how to use it securely?",
          category: "Security",
        },
        {
          id: "11",
          text: "How to prevent brute-force login attacks?",
          category: "Security",
        },
        {
          id: "12",
          text: "How to use Content Security Policy (CSP)?",
          category: "Security",
        },
        {
          id: "13",
          text: "How to validate user input effectively?",
          category: "Security",
        },
        {
          id: "14",
          text: "Best practices for OAuth2 implementation",
          category: "Security",
        },
        {
          id: "15",
          text: "How to protect against clickjacking?",
          category: "Security",
        },
      ]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    setQuery(recommendation.text);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, messagesEndRef]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Code copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy code");
      console.error("Failed to copy text: ", err);
    }
  };

  const handleEdit = (code: string) => {
    setEditingCode(code);
    // You can implement your edit functionality here
    // For example, open a modal or navigate to an editor
    toast.success(
      "Edit functionality will be implemented based on your requirements"
    );
  };

  const parseCodeBlocks = (content: string): (string | CodeBlock)[] => {
    const parts: (string | CodeBlock)[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // Add code block
      parts.push({
        language: match[1] || "plaintext",
        code: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last code block
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts;
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // const triggerImageSelect = () => {
  //   fileInputRef.current?.click();
  // };

  const handleQuery = async () => {
    if (!query.trim() && !selectedImage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: selectedImage ? `${query}\n[Image attached]` : query,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);

    const currentQuery = query;
    const currentImage = selectedImage;
    setQuery("");
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLoading(true);

    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: currentImage
        ? "Analyzing your image and query..."
        : "Analyzing your security query...",
      isUser: false,
      thinking: true,
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      let response;
      if (currentImage) {
        // Handle image analysis
        const formData = new FormData();
        formData.append("image", currentImage);
        formData.append("message", currentQuery);
        // console.log("Form data sending : ", formData);
        response = await axios.post(
          "http://localhost:3000/image-analysis",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // Handle text query
        // console.log("Sending query:", currentQuery);
        response = await axios.post(
          "http://localhost:3000/query/false",
          currentQuery,
          {
            headers: { "Content-Type": "text/plain" },
          }
        );
      }

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== thinkingMessage.id)
      );

      const aiMessage: Message = {
        id: Date.now().toString(),
        content: response.data,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: currentImage
          ? "I apologize, but I encountered an issue while analyzing your image. Could you please try again?"
          : "I apologize, but I encountered an issue while processing your security query. Could you please rephrase or try a different question?",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCodeBlock = (codeBlock: CodeBlock) => {
    return (
      <div className="w-full my-2">
        <div className="relative">
          <div className="absolute top-3 left-4 text-xs text-gray-400 font-mono">
            {codeBlock.language}
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={() => handleCopy(codeBlock.code)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Copy code"
            >
              <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
            <button
              onClick={() => handleEdit(codeBlock.code)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Edit code"
            >
              <Pencil className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
          <SyntaxHighlighter
            language={codeBlock.language}
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              padding: "2rem 1rem 1rem 1rem",
              backgroundColor: "#1e1e1e",
            }}
          >
            {codeBlock.code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  };

  const renderMessageContent = (content: string) => {
    const parts = parseCodeBlocks(content);
    return parts.map((part, index) => {
      if (typeof part === "string") {
        return (
          <ReactMarkdown
            key={index}
            className="prose prose-sm dark:prose-invert max-w-none"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
              a: ({ children, href }) => (
                <a
                  href={href}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="bg-gray-200 dark:bg-gray-800 dark:text-white rounded px-1 py-0.5">
                  {children}
                </code>
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        );
      } else {
        return renderCodeBlock(part);
      }
    });
  };

  return (
    <Card className="w-full mx-auto h-[600px] flex flex-col bg-white dark:bg-[#161d27] dark:text-white">
      <CardHeader className="border-b">
        <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
          <ShieldCheck className="mr-2 text-emerald-500" /> Security Query
          Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 overflow-hidden flex flex-col">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Secure the Digital Frontier
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Ask me anything about cybersecurity, upload images for analysis,
                or choose from suggestions below.
              </p>
            </div>
          </div>
        )}
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`group flex gap-3 text-sm ${
                    message.isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex flex-col gap-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-FQT5qBTHbXs5vWf6ltC86UaEfrXYG1.png"
                          alt="Security AI"
                        />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div
                    className={`flex flex-col gap-2 ${
                      message.isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`relative px-4 py-2 rounded-2xl ${
                        message.isUser
                          ? "bg-gray-100 hover:bg-gray-200 dark:text-black transition-colors px-2"
                          : message.thinking
                          ? "bg-gray-100 text-gray-600 dark:text-gray-800"
                          : "bg-gray-100 text-black dark:text-black"
                      } ${
                        message.content.includes("```")
                          ? "max-w-[85%] w-[85%]"
                          : ""
                      }`}
                    >
                      {message.thinking ? (
                        <div className="flex items-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {message.content}
                        </div>
                      ) : (
                        renderMessageContent(message.content)
                      )}
                      {message.isUser && (
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-6 top-1/2 -translate-y-1/2">
                          <LinkIcon className="w-4 h-4 text-gray-400 dark:text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        {/*Suggestions section */}
        <div className="px-6 pb-4">
          <div className=" flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700 dark:text-gray-300 text-sm">
              Suggestions
            </h3>
          </div>
          {loadingRecommendations ? (
            <div className="flex gap-3 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse min-w-32 flex-shrink-0"
                ></div>
              ))}
            </div>
          ) : (
            <div className="relative flex items-center">
              {/* Left scroll arrow */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollSuggestions("left")}
                  className="absolute -left-8 z-20 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}

              {/* Right scroll arrow */}
              {canScrollRight && (
                <button
                  onClick={() => scrollSuggestions("right")}
                  className="absolute -right-8 z-20 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}

              {/* Left fade - extends to component border */}
              {/* <div className="absolute -left-2 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent z-10 pointer-events-none"></div> */}

              {/* Right fade - extends to component border */}
              {/* <div className="absolute -right-2 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent z-10 pointer-events-none"></div> */}

              {/* Scrollable suggestions */}
              <div
                ref={suggestionsScrollRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-0"
                onScroll={checkScrollPosition}
              >
                {recommendations.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => handleRecommendationClick(rec)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 whitespace-nowrap flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <span>{rec.text}</span>
                    <svg
                      className="w-3 h-3 text-gray-400 dark:text-gray-500 transform rotate-45"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14m-7-7l7 7-7 7"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 relative">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img
                src={imagePreview || "/placeholder.svg"}
                alt="Selected image"
                className="max-w-32 max-h-32 rounded-lg border"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery();
            }}
            className="flex space-x-2"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="flex-grow relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  selectedImage
                    ? "Describe what you want to analyze in the image..."
                    : "Ask your security question..."
                }
                className="flex-grow bg-white text-black border-gray-300 pr-10"
              />
              {/* <button
                type="button"
                onClick={triggerImageSelect}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                title="Attach image"
              >
                <ImageIcon className="w-4 h-4 text-gray-500" />
              </button> */}
            </div>
            <Button
              type="submit"
              disabled={isLoading || (!query.trim() && !selectedImage)}
              className="bg-emerald-500 text-white hover:bg-emerald-600"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
