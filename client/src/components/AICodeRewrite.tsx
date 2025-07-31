"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, RefreshCw, ChevronDown } from "lucide-react"
import axios from "axios"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import { AnimatedCode } from "./AnimatedCode"

// Import all languages you want to support
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript"
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python"
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java"
// Add more languages as needed

SyntaxHighlighter.registerLanguage("javascript", js)
SyntaxHighlighter.registerLanguage("python", python)
SyntaxHighlighter.registerLanguage("java", java)
// Register more languages as needed

interface Vulnerability {
  id: number
  type: string
  name: string
  severity: "Low" | "Medium" | "High"
  location: string
}

interface AICodeRewriteProps {
  vulnerabilities: Vulnerability[]
}

export default function AICodeRewrite({ vulnerabilities }: AICodeRewriteProps) {
  const [originalCode, setOriginalCode] = useState("")
  const [rewrittenCode, setRewrittenCode] = useState("")
  const [isRewriting, setIsRewriting] = useState(false)
  const [activeTab, setActiveTab] = useState("original")
  const [language, setLanguage] = useState("javascript")
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(true)
  const rewrittenCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    detectLanguage(originalCode)
  }, [originalCode])

  useEffect(() => {
    if (rewrittenCode && activeTab === "rewritten") {
      scrollToBottom()
    }
  }, [rewrittenCode, activeTab])

  const detectLanguage = (code: string) => {
    if (code.includes("def ") || code.includes("import ")) {
      setLanguage("python")
    } else if (code.includes("public class ") || code.includes("System.out.println")) {
      setLanguage("java")
    } else {
      setLanguage("javascript")
    }
  }

  const handleRewrite = async () => {
    setIsRewriting(true)
    setActiveTab("rewritten")
    setShouldAnimate(true)
    setRewrittenCode("") // Clear previous output
    const url = "http://codeshield-web-prod-server.vercel.app/ai"
    const prefixInfo =
      "Optimize and correct the following code to make it the best version possible, ensuring it is efficient, free from vulnerabilities, and adheres to best practices. Provide only the corrected and optimized code without any explanation or description.And also don't send any unneccessary comment, but you can send examples to use that rewritten code and any information you think that user needs to know to use that rewritten code. \n\n";
    const message = prefixInfo + originalCode;

    try {
      const response = await axios.post(url, message, {
        headers: {
          "Content-Type": "text/plain",
        },
      })

      const aiResponse = response.data;
      const match = aiResponse.match(/```(\w+)\n([\s\S]+?)```/)
      if (match) {
        setLanguage(match[1])
        setRewrittenCode(match[2].trim())
      } else {
        setRewrittenCode(aiResponse)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsRewriting(false)
    }
  }

  const handleScroll = () => {
    if (rewrittenCodeRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = rewrittenCodeRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
      setShowScrollButton(!isNearBottom)
    }
  }

  const scrollToBottom = () => {
    if (rewrittenCodeRef.current) {
      rewrittenCodeRef.current.scrollTo({
        top: rewrittenCodeRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "rewritten") {
      setShouldAnimate(false)
    }
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>AI Code Rewrite</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original">Original Code</TabsTrigger>
            <TabsTrigger value="rewritten">Rewritten Code</TabsTrigger>
          </TabsList>
          <TabsContent value="original">
            <textarea
              placeholder="Paste your original code here"
              value={originalCode}
              onChange={(e) => setOriginalCode(e.target.value)}
              rows={20}
              className="w-full p-2 font-mono text-sm mt-2 border rounded-md"
            />
          </TabsContent>
          <TabsContent value="rewritten">
            <div className="relative">
              {/* Scrollable container */}
              <div ref={rewrittenCodeRef} onScroll={handleScroll} className="h-[400px] overflow-auto border rounded-md">
                {rewrittenCode ? (
                  <AnimatedCode code={rewrittenCode} language={language} shouldAnimate={shouldAnimate} />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    Rewritten code will appear here
                  </div>
                )}
              </div>

              {/* Fixed Scroll to Bottom Button */}
              <Button
                onClick={scrollToBottom}
                className={`absolute bottom-4 right-4 rounded-full transition-opacity duration-300 ${
                  showScrollButton ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                size="icon"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between mt-4">
          <Button onClick={handleRewrite} disabled={isRewriting || !originalCode}>
            {isRewriting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Code className="mr-2 h-4 w-4" />
                Rewrite Code
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

