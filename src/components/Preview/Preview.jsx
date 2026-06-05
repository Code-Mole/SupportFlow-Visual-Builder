import { useState, useEffect, useRef } from 'react'
import './Preview.css'

const IconArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12,19 5,12 12,5"/>
  </svg>
)

const IconRefresh = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
)

const IconBot = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
    <circle cx="8"  cy="16" r="1" fill="currentColor"/>
    <circle cx="16" cy="16" r="1" fill="currentColor"/>
  </svg>
)

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
)

// ── Message types ──
// { type: 'bot',  text, id }
// { type: 'user', text }
// { type: 'end' }

function TypingIndicator() {
  return (
    <div className="preview__typing">
      <div className="preview__typing-dot" style={{ animationDelay: '0ms' }}   />
      <div className="preview__typing-dot" style={{ animationDelay: '160ms' }} />
      <div className="preview__typing-dot" style={{ animationDelay: '320ms' }} />
    </div>
  )
}

export default function Preview({ nodes, onExit }) {
  const startNode = nodes.find(n => n.type === 'start') ?? nodes[0]

  const [messages,        setMessages]        = useState([])
  const [currentNode,     setCurrentNode]     = useState(null)
  const [isTyping,        setIsTyping]        = useState(false)
  const [isEnded,         setIsEnded]         = useState(false)
  const [pendingOptions,  setPendingOptions]  = useState([])

  const bottomRef = useRef(null)

  // ── Scroll to bottom whenever messages change ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Boot: show first bot message on mount ──
  useEffect(() => {
    triggerBotMessage(startNode)
  }, []) // eslint-disable-line

  // ── Helpers ──
  function findNode(id) {
    return nodes.find(n => n.id === id) ?? null
  }

  function triggerBotMessage(node) {
    if (!node) return
    setCurrentNode(node)
    setPendingOptions([])
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [
        ...prev,
        { type: 'bot', text: node.text, nodeId: node.id }
      ])

      if (node.type === 'end') {
        setIsEnded(true)
        setPendingOptions([])
      } else {
        setPendingOptions(node.options || [])
      }
    }, 900)
  }

  function handleOptionClick(option) {
    if (!option) return

    // lock options while traversing
    setPendingOptions([])

    // add user reply bubble
    setMessages(prev => [
      ...prev,
      { type: 'user', text: option.label }
    ])

    // find and render next node
    const next = findNode(option.nextId)
    if (next) {
      setTimeout(() => triggerBotMessage(next), 400)
    } else {
      setIsEnded(true)
    }
  }

  function handleRestart() {
    setMessages([])
    setCurrentNode(null)
    setIsTyping(false)
    setIsEnded(false)
    setPendingOptions([])
    setTimeout(() => triggerBotMessage(startNode), 200)
  }

  return (
    <div className="preview">

      {/* ── Top bar ── */}
      <div className="preview__topbar">
        <button className="preview__back-btn" onClick={onExit}>
          <IconArrowLeft />
          <span>Back to Editor</span>
        </button>

        <div className="preview__topbar-center">
          <div className="preview__live-dot" />
          <span className="preview__topbar-label">Preview Mode</span>
        </div>

        <button className="preview__restart-top-btn" onClick={handleRestart}>
          <IconRefresh />
          <span>Restart</span>
        </button>
      </div>

      {/* ── Chat window ── */}
      <div className="preview__stage">
        <div className="preview__window">

          {/* window chrome */}
          <div className="preview__window-header">
            <div className="preview__window-dots">
              <span /><span /><span />
            </div>
            <div className="preview__window-title">
              <div className="preview__bot-status" />
              <span>SupportFlow Bot</span>
            </div>
            <div style={{ width: 52 }} />
          </div>

          {/* messages */}
          <div className="preview__messages">

            {messages.map((msg, idx) => (
              msg.type === 'bot' ? (
                <div key={idx} className="preview__msg preview__msg--bot">
                  <div className="preview__avatar preview__avatar--bot">
                    <IconBot />
                  </div>
                  <div className="preview__bubble preview__bubble--bot">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <div key={idx} className="preview__msg preview__msg--user">
                  <div className="preview__bubble preview__bubble--user">
                    {msg.text}
                  </div>
                  <div className="preview__avatar preview__avatar--user">
                    <IconUser />
                  </div>
                </div>
              )
            ))}

            {/* typing indicator */}
            {isTyping && (
              <div className="preview__msg preview__msg--bot">
                <div className="preview__avatar preview__avatar--bot">
                  <IconBot />
                </div>
                <div className="preview__bubble preview__bubble--bot preview__bubble--typing">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {/* end state */}
            {isEnded && !isTyping && (
              <div className="preview__end-state">
                <div className="preview__end-icon">
                  <IconCheckCircle />
                </div>
                <p className="preview__end-label">Conversation ended</p>
                <button className="preview__restart-btn" onClick={handleRestart}>
                  <IconRefresh />
                  <span>Restart Conversation</span>
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* option buttons */}
          {pendingOptions.length > 0 && !isTyping && (
            <div className="preview__options">
              <p className="preview__options-label">Choose a response</p>
              <div className="preview__options-grid">
                {pendingOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    className="preview__option-btn"
                    onClick={() => handleOptionClick(opt)}
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* node path tracker */}
        {currentNode && (
          <div className="preview__tracker">
            <span className="preview__tracker-label">Current node</span>
            <span className="preview__tracker-id">#{currentNode.id}</span>
            <span
              className="preview__tracker-type"
              style={{
                color: currentNode.type === 'start'    ? 'var(--node-start-color)'
                     : currentNode.type === 'question' ? 'var(--node-question-color)'
                     : 'var(--node-end-color)'
              }}
            >
              {currentNode.type}
            </span>
          </div>
        )}
      </div>

    </div>
  )
}