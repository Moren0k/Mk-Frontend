import type {
  GameReceivedEvent,
  OperationEvent,
  OperationEventType,
  SseEventHandlers,
  SseEnvelope,
  StatsRollingEvent,
} from './types'
import { ApiError, parseApiErrorResponse } from './client'
import { getApiBaseUrl, getApiKey } from './config'

export interface SseController {
  abort: () => void
}

const OPERATION_EVENT_TYPES: readonly OperationEventType[] = [
  'operation.opened',
  'operation.mg1',
  'operation.mg2',
  'operation.tie',
  'operation.won',
  'operation.lost',
  'operation.cancelled',
]

const LINE_SEPARATORS = /(?:\r\n|\n|\r)/

function extractField(frame: string, fieldName: string): string | null {
  const lines = frame.split(LINE_SEPARATORS)
  const values: string[] = []
  let found = false

  for (const line of lines) {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }
    const name = line.slice(0, separatorIndex)
    if (name !== fieldName) {
      continue
    }
    let value = line.slice(separatorIndex + 1)
    if (value.startsWith(' ')) {
      value = value.slice(1)
    }
    values.push(value)
    found = true
  }

  if (!found) {
    return null
  }
  if (fieldName === 'data') {
    return values.join('\n')
  }
  return values[0] ?? null
}

function dispatchEvent(handlers: SseEventHandlers, data: string): void {
  let parsed: unknown
  try {
    parsed = JSON.parse(data)
  } catch {
    return
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return
  }

  const envelope = parsed as SseEnvelope<unknown>
  if (typeof envelope.type !== 'string' || envelope.payload === undefined) {
    return
  }

  if (envelope.type === 'game.received') {
    handlers.onGameReceived?.(envelope as GameReceivedEvent)
    return
  }

  if (envelope.type === 'stats.rolling') {
    handlers.onStatsRolling?.(envelope as StatsRollingEvent)
    return
  }

  if (OPERATION_EVENT_TYPES.includes(envelope.type as OperationEventType)) {
    handlers.onOperation?.(envelope as OperationEvent)
    return
  }

  return
}

export async function startEventsStream(handlers: SseEventHandlers): Promise<SseController> {
  const controller = new AbortController()

  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}/events/stream`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
        'X-Api-Key': getApiKey(),
      },
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError({
        code: 'NETWORK_ERROR',
        message: 'La conexión al stream fue abortada',
        httpStatus: null,
      })
    }
    throw new ApiError({
      code: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Error de red',
      httpStatus: null,
    })
  }

  if (!response.ok) {
    throw await parseApiErrorResponse(response)
  }

  if (!response.body) {
    throw new ApiError({
      code: 'INVALID_RESPONSE',
      message: 'El stream no tiene cuerpo',
      httpStatus: response.status,
    })
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const processChunk = (text: string): void => {
    buffer += text
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const rawFrame = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)

      const eventName = extractField(rawFrame, 'event')
      const data = extractField(rawFrame, 'data')
      if (eventName && data) {
        dispatchEvent(handlers, data)
      }

      boundary = buffer.indexOf('\n\n')
    }
  }

  const pump = async (): Promise<void> => {
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (buffer.trim().length > 0) {
            processChunk('\n\n')
          }
          return
        }
        processChunk(decoder.decode(value, { stream: true }))
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        handlers.onError?.(
          error instanceof Error ? error : new Error('Error desconocido en el stream'),
        )
      }
    }
  }

  void pump()

  return {
    abort: () => controller.abort(),
  }
}
