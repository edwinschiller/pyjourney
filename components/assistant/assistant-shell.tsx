"use client"

import {
  ArrowUp,
  History,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  X,
} from "lucide-react"
import Image from "next/image"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PropsWithChildren,
  type ReactNode,
} from "react"
import { flushSync } from "react-dom"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  IDE_ASSISTANT_SCOPE,
  IDE_QUICK_PROMPTS,
  LESSON_QUICK_PROMPTS,
} from "@/lib/assistant/constants"
import type { AssistantChatContext } from "@/lib/assistant/prompts"
import { splitMarkdownSegments } from "@/lib/markdown/fences"
import { cn } from "@/lib/utils"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
  isStreaming?: boolean
}

type ConversationSummary = {
  id: string
  title: string
  messageCount: number
  preview: string | null
  updatedAt: string
}

type AssistantShellProps = PropsWithChildren<{
  context: AssistantChatContext
  studentCode: string
  contextLabel: string
  contentLayout?: "lesson" | "full"
  aiConfigured?: boolean
}>

const LESSON_WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I help step by step — without the full solution. Ask a question or pick a prompt.",
}

const IDE_WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I can see your editor code and terminal output. Ask about errors, ideas, or the next step.",
}

const createId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso)
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  return date.toLocaleDateString("en", { day: "2-digit", month: "short" })
}

const AssistantMark = ({ className }: { className?: string }) => (
  <Image
    src="/brand/icon.svg"
    alt=""
    width={28}
    height={28}
    className={cn("shrink-0 rounded-md", className)}
    aria-hidden
  />
)

const renderInline = (text: string, keyPrefix = "") => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}${index}`} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${keyPrefix}${index}`}
          className="rounded bg-black/15 px-1 py-0.5 font-mono text-[0.88em] dark:bg-white/10"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={`${keyPrefix}${index}`}>{part}</span>
  })
}

const headingMatch = (line: string) => {
  const match = line.match(/^(#{1,3})\s+(.+)$/)
  if (!match) return null
  return { level: match[1]!.length, text: match[2]! }
}

const MessageText = ({ text }: { text: string }) => {
  const segments = splitMarkdownSegments(text)

  return (
    <div className="space-y-2">
      {segments.map((segment, blockIdx) => {
        if (segment.type === "code") {
          const code = segment.code
          const isSingleLine = !code.includes("\n")
          return (
            <pre
              key={blockIdx}
              className={cn(
                "overflow-x-auto rounded-lg bg-black/20 font-mono text-[13px] whitespace-pre text-[var(--app-fg)] dark:bg-black/40",
                isSingleLine
                  ? "px-3 py-2 leading-normal"
                  : "p-3 leading-relaxed"
              )}
            >
              <code>{code}</code>
            </pre>
          )
        }

        const lines = segment.text.split("\n")
        const elements: ReactNode[] = []
        let listItems: ReactNode[] = []
        let listKind: "ol" | "ul" | null = null

        const flushList = () => {
          if (listItems.length === 0) return
          if (listKind === "ol") {
            elements.push(
              <ol
                key={`ol-${elements.length}`}
                className="list-decimal space-y-0.5 pl-5"
              >
                {listItems}
              </ol>
            )
          } else {
            elements.push(
              <ul
                key={`ul-${elements.length}`}
                className="list-disc space-y-0.5 pl-5"
              >
                {listItems}
              </ul>
            )
          }
          listItems = []
          listKind = null
        }

        lines.forEach((line, lineIdx) => {
          const olMatch = line.match(/^\d+\.\s+(.+)/)
          const ulMatch = line.match(/^[-•*]\s+(.+)/)
          const heading = headingMatch(line.trim())

          if (olMatch) {
            if (listKind !== "ol") flushList()
            listKind = "ol"
            listItems.push(
              <li key={lineIdx}>
                {renderInline(olMatch[1]!, `${blockIdx}-${lineIdx}-`)}
              </li>
            )
            return
          }

          if (ulMatch) {
            if (listKind !== "ul") flushList()
            listKind = "ul"
            listItems.push(
              <li key={lineIdx}>
                {renderInline(ulMatch[1]!, `${blockIdx}-${lineIdx}-`)}
              </li>
            )
            return
          }

          flushList()

          if (line.trim() === "") {
            elements.push(<br key={`br-${blockIdx}-${lineIdx}`} />)
            return
          }

          if (heading) {
            const HeadingTag = (
              heading.level === 1 ? "h3" : heading.level === 2 ? "h4" : "h5"
            ) as "h3" | "h4" | "h5"
            elements.push(
              <HeadingTag
                key={`h-${blockIdx}-${lineIdx}`}
                className={cn(
                  "font-bold text-[var(--app-fg)]",
                  heading.level === 1 && "text-base",
                  heading.level === 2 && "text-[0.95rem]",
                  heading.level === 3 && "text-sm"
                )}
              >
                {renderInline(heading.text, `${blockIdx}-${lineIdx}-`)}
              </HeadingTag>
            )
            return
          }

          elements.push(
            <p
              key={`p-${blockIdx}-${lineIdx}`}
              className="text-sm leading-relaxed whitespace-pre-wrap"
            >
              {renderInline(line, `${blockIdx}-${lineIdx}-`)}
            </p>
          )
        })

        flushList()
        return <div key={blockIdx}>{elements}</div>
      })}
    </div>
  )
}

const ChatBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user"
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start gap-2"
      )}
    >
      {!isUser ? (
        <div className="mt-0.5 shrink-0">
          <AssistantMark className="scale-[0.9]" />
        </div>
      ) : null}
      <div
        className={cn(
          "max-w-[90%] text-sm leading-relaxed",
          isUser
            ? "rounded-2xl rounded-tr-md px-3.5 py-2.5 text-white"
            : cn(
                "rounded-2xl rounded-tl-md border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-2.5 text-[var(--app-fg)]",
                message.isStreaming &&
                  !message.text &&
                  "flex min-h-[2.75rem] min-w-[4.5rem] items-center justify-center"
              )
        )}
        style={
          isUser
            ? {
                background:
                  "linear-gradient(135deg, var(--python-blue-light), var(--python-blue))",
              }
            : undefined
        }
      >
        {message.isStreaming && !message.text ? (
          <span
            className="flex min-w-[3.25rem] items-center justify-center gap-1.5 px-1 py-1.5"
            aria-label="Thinking"
            role="status"
          >
            <span className="size-2 animate-bounce rounded-full bg-[var(--python-blue)] opacity-80 [animation-duration:900ms]" />
            <span className="size-2 animate-bounce rounded-full bg-[var(--python-blue)] opacity-80 [animation-delay:150ms] [animation-duration:900ms]" />
            <span className="size-2 animate-bounce rounded-full bg-[var(--python-blue)] opacity-80 [animation-delay:300ms] [animation-duration:900ms]" />
          </span>
        ) : (
          <MessageText text={message.text} />
        )}
        {message.isStreaming && message.text ? (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--python-blue)] align-middle" />
        ) : null}
      </div>
    </div>
  )
}

export const AssistantShell = ({
  children,
  context,
  studentCode,
  contextLabel,
  contentLayout = "lesson",
  aiConfigured = true,
}: AssistantShellProps) => {
  const [open, setOpen] = useState(false)

  const welcome = aiConfigured
    ? context.scope === "ide"
      ? IDE_WELCOME
      : LESSON_WELCOME
    : {
        id: "welcome",
        role: "assistant" as const,
        text: "AI chat needs an OPENAI_API_KEY. Lessons, checks, and rule-based insights still work without it.",
      }
  const quickPrompts =
    context.scope === "ide" ? IDE_QUICK_PROMPTS : LESSON_QUICK_PROMPTS
  const scopeKey =
    context.scope === "lesson" ? context.lessonId : IDE_ASSISTANT_SCOPE

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col",
        contentLayout === "full" ? "h-full overflow-hidden" : "overflow-y-auto"
      )}
    >
      {contentLayout === "full" ? (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      ) : (
        children
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <AssistantPanel
          open={open}
          onOpenChange={setOpen}
          context={context}
          studentCode={studentCode}
          contextLabel={contextLabel}
          scopeKey={scopeKey}
          welcomeMessage={welcome}
          quickPrompts={quickPrompts}
          aiConfigured={aiConfigured}
        />
      </Dialog>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-6 bottom-6 z-30 flex items-center gap-2.5 rounded-2xl border border-[var(--python-blue-dark)] px-4 py-3 shadow-[var(--app-shadow)] transition-all hover:brightness-105 lg:right-8 lg:bottom-8"
          style={{
            background:
              "linear-gradient(135deg, var(--python-blue-light), var(--python-blue))",
          }}
          aria-label="Open Python help"
        >
          <MessageCircle className="size-5 text-white" aria-hidden />
          <span className="text-sm font-semibold text-white">Help</span>
        </button>
      ) : null}
    </div>
  )
}

type AssistantPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context: AssistantChatContext
  studentCode: string
  contextLabel: string
  scopeKey: string
  welcomeMessage: ChatMessage
  quickPrompts: readonly string[]
  aiConfigured: boolean
}

const AssistantPanel = ({
  open,
  onOpenChange,
  context,
  studentCode,
  contextLabel,
  scopeKey,
  welcomeMessage,
  quickPrompts,
  aiConfigured,
}: AssistantPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [chatTitle, setChatTitle] = useState("New chat")
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [hydrating, setHydrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [historySearch, setHistorySearch] = useState("")
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasCode =
    Boolean(studentCode.trim()) ||
    (context.scope === "ide" &&
      Boolean(
        context.terminalOutput?.trim() || context.terminalError?.trim()
      ))

  const loadConversations = useCallback(
    async (search?: string) => {
      setLoadingHistory(true)
      try {
        const params = new URLSearchParams({
          scopeKey,
          list: "1",
        })
        if (search?.trim()) params.set("q", search.trim())
        const response = await fetch(`/api/assistant/history?${params}`)
        if (!response.ok) return
        const data = (await response.json()) as {
          conversations?: ConversationSummary[]
        }
        setConversations(data.conversations ?? [])
      } finally {
        setLoadingHistory(false)
      }
    },
    [scopeKey]
  )

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setHydrating(true)
    void (async () => {
      try {
        const response = await fetch(
          `/api/assistant/history?scopeKey=${encodeURIComponent(scopeKey)}`
        )
        if (!response.ok || cancelled) return
        const data = (await response.json()) as {
          conversation?: {
            id: string
            title?: string
            messages: Array<{
              id: string
              role: "user" | "assistant"
              text: string
            }>
          } | null
        }
        if (cancelled) return
        if (data.conversation?.messages?.length) {
          setConversationId(data.conversation.id)
          setChatTitle(data.conversation.title ?? "Chat")
          setMessages(data.conversation.messages)
        } else {
          setConversationId(null)
          setChatTitle("New chat")
          setMessages([welcomeMessage])
        }
      } catch {
        if (!cancelled) setMessages([welcomeMessage])
      } finally {
        if (!cancelled) setHydrating(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, scopeKey, welcomeMessage])

  useEffect(() => {
    if (!open || !showHistory) return
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      void loadConversations(historySearch)
    }, 280)
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [open, showHistory, historySearch, loadConversations])

  useEffect(() => {
    if (!open) return
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    const timer = window.setTimeout(() => inputRef.current?.focus(), 180)
    return () => window.clearTimeout(timer)
  }, [open, messages, busy])

  const handleNewChat = async () => {
    setError(null)
    const response = await fetch("/api/assistant/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: context.scope,
        scopeKey,
        title: "New chat",
      }),
    })
    if (!response.ok) {
      setError("Could not start a new chat.")
      return
    }
    const data = (await response.json()) as {
      conversation: { id: string; title?: string }
    }
    setConversationId(data.conversation.id)
    setChatTitle(data.conversation.title ?? "New chat")
    setMessages([welcomeMessage])
    setShowHistory(false)
    void loadConversations()
  }

  const handleSelectConversation = async (id: string) => {
    setShowHistory(false)
    setHydrating(true)
    try {
      const response = await fetch(
        `/api/assistant/history?conversationId=${encodeURIComponent(id)}`
      )
      if (!response.ok) return
      const data = (await response.json()) as {
        conversation?: {
          id: string
          title?: string
          messages: ChatMessage[]
        }
      }
      if (!data.conversation) return
      setConversationId(data.conversation.id)
      setChatTitle(data.conversation.title ?? "Chat")
      setMessages(
        data.conversation.messages.length > 0
          ? data.conversation.messages
          : [welcomeMessage]
      )
    } finally {
      setHydrating(false)
    }
  }

  const sendQuestion = async (question: string) => {
    const trimmed = question.trim()
    if (!trimmed || busy) return
    if (!aiConfigured) {
      setError(
        "AI chat is unavailable until OPENAI_API_KEY is set on the server."
      )
      return
    }
    setBusy(true)
    setError(null)
    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: trimmed,
    }
    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      text: "",
      isStreaming: true,
    }
    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setDraft("")
    onOpenChange(true)

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(conversationId ? { conversationId } : {}),
          question: trimmed,
          studentCode: studentCode ?? "",
          context,
        }),
      })
      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(payload?.error ?? "Chat failed.")
      }

      const headerId = response.headers.get("X-Conversation-Id")
      if (headerId) {
        setConversationId(headerId)
        if (chatTitle === "New chat") setChatTitle(trimmed.slice(0, 48))
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let assembled = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() ?? ""
        for (const part of parts) {
          const lines = part.split("\n")
          const dataLine = lines.find((line) => line.startsWith("data: "))
          if (!dataLine) continue
          const payload = dataLine.slice(6)
          try {
            const chunk = JSON.parse(payload) as
              | string
              | { conversationId?: string }
            if (typeof chunk === "string") {
              assembled += chunk
              flushSync(() => {
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === assistantMessage.id
                      ? { ...message, text: assembled, isStreaming: true }
                      : message
                  )
                )
              })
            } else if (chunk.conversationId) {
              setConversationId(chunk.conversationId)
            }
          } catch {
            // ignore malformed chunks
          }
        }
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                text: assembled.trim() || "No reply received.",
                isStreaming: false,
              }
            : message
        )
      )
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Chat failed.")
      setMessages((prev) =>
        prev.filter((message) => message.id !== assistantMessage.id)
      )
    } finally {
      setBusy(false)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void sendQuestion(draft)
    }
  }

  return (
    <DialogContent
      showCloseButton={false}
      className="flex h-[min(82vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0"
      aria-describedby={undefined}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-3">
        <AssistantMark />
        <div className="min-w-0 flex-1">
          <DialogTitle className="truncate text-sm font-bold">
            Python Help
          </DialogTitle>
          <DialogDescription className="truncate text-[11px]">
            {chatTitle} · {contextLabel}
          </DialogDescription>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowHistory((value) => !value)
            if (!showHistory) void loadConversations()
          }}
          className={cn(
            "rounded-lg p-2 text-[var(--app-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-fg)]",
            showHistory &&
              "bg-[var(--app-accent-soft)] text-[var(--python-blue)]"
          )}
          aria-label="Chat history"
          aria-pressed={showHistory}
        >
          <History className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => void handleNewChat()}
          className="rounded-lg p-2 text-[var(--app-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-fg)]"
          aria-label="New chat"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-lg p-2 text-[var(--app-muted)] hover:bg-[var(--app-surface-hover)] hover:text-[var(--app-fg)]"
          aria-label="Close help"
        >
          <X className="size-4" />
        </button>
      </header>

      {showHistory ? (
        <div className="flex max-h-[140px] min-h-0 shrink-0 flex-col overflow-hidden border-b border-[var(--app-border)] bg-[var(--app-bg)]">
          <div className="flex items-center gap-2 px-3 py-2">
            <Search className="size-3.5 shrink-0 text-[var(--app-muted)]" />
            <input
              type="search"
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
              placeholder="Search chats…"
              className="min-w-0 flex-1 bg-transparent text-xs text-[var(--app-fg)] placeholder:text-[var(--app-muted)] focus:outline-none"
              aria-label="Search chats"
            />
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="rounded p-1 text-[var(--app-muted)] hover:text-[var(--app-fg)]"
              aria-label="Close history"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {loadingHistory ? (
              <li className="px-2 py-3 text-center text-xs text-[var(--app-muted)]">
                Loading…
              </li>
            ) : null}
            {!loadingHistory && conversations.length === 0 ? (
              <li className="px-2 py-3 text-center text-xs text-[var(--app-muted)]">
                No chats yet — start with +
              </li>
            ) : null}
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => void handleSelectConversation(conversation.id)}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                    conversationId === conversation.id
                      ? "bg-[var(--app-accent-soft)]"
                      : "hover:bg-[var(--app-surface-hover)]"
                  )}
                >
                  <p className="min-w-0 truncate text-[11px] font-medium text-[var(--app-fg)]">
                    {conversation.title}
                  </p>
                  <span className="shrink-0 text-[10px] text-[var(--app-muted)]">
                    {formatRelativeTime(conversation.updatedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {hasCode ? (
        <p className="shrink-0 border-b border-[var(--app-border)] bg-[var(--app-accent-soft)] px-4 py-1.5 text-[10px] font-medium text-[var(--python-blue)]">
          Your current code
          {context.scope === "ide" ? " and terminal" : ""} is sent with each
          question
        </p>
      ) : null}

      <div
        ref={listRef}
        className="min-h-0 flex-1 basis-0 overflow-y-auto overscroll-contain px-3 py-3"
      >
        <div className="flex flex-col gap-3">
          {hydrating ? (
            <p className="text-center text-xs text-[var(--app-muted)]">
              Loading history…
            </p>
          ) : null}
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </div>
      </div>

      <footer className="shrink-0 border-t border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3">
        {!aiConfigured ? (
          <p
            className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-100"
            role="status"
          >
            AI chat is optional. Set{" "}
            <code className="font-mono">OPENAI_API_KEY</code> to enable Help
            replies. Lessons and checks keep working.
          </p>
        ) : null}
        {error ? (
          <p className="mb-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={busy || !aiConfigured}
              onClick={() => void sendQuestion(prompt)}
              className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface)] px-2 py-1 text-left text-[10px] font-medium leading-snug text-[var(--app-fg)] hover:border-[var(--python-blue-light)] hover:bg-[var(--app-accent-soft)] disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex items-end gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-2 transition-[border-color,box-shadow] focus-within:border-[var(--python-blue-light)] focus-within:shadow-[0_0_0_3px_var(--app-accent-soft)]">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder={
              aiConfigured ? "Your question…" : "AI chat needs an API key…"
            }
            aria-label="Ask the assistant"
            className="max-h-24 min-h-[40px] flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm text-[var(--app-fg)] outline-none placeholder:text-[var(--app-muted)] ring-0 focus-visible:outline-none disabled:opacity-60"
            disabled={busy || !aiConfigured}
          />
          <button
            type="button"
            onClick={() => void sendQuestion(draft)}
            disabled={busy || !aiConfigured || !draft.trim()}
            className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-blue)] text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--python-blue-light)] disabled:opacity-40"
            aria-label="Send message"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin text-white" aria-hidden />
            ) : (
              <ArrowUp className="size-4 text-white" strokeWidth={2.5} />
            )}
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-[var(--app-muted)]">
          Enter to send · Shift+Enter for newline
        </p>
      </footer>
    </DialogContent>
  )
}
