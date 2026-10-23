export const responseStates = ['active', 'archived', 'deleted'] as const
export type ResponseState = typeof responseStates[number]
export type ResponseAction = 'archive' | 'restore' | 'delete'
export function responseTransition(action: unknown, current: unknown): ResponseState {
  if (!responseStates.includes(current as ResponseState)) throw new Error('Reload this response before changing it.')
  if (action === 'archive' && current === 'active') return 'archived'
  if (action === 'delete' && current !== 'deleted') return 'deleted'
  if (action === 'restore' && current !== 'active') return 'active'
  throw new Error('This action is not available for the current response state.')
}
export function paymentLabel(state: string, rootsApplication = false) {
  if (rootsApplication && state === 'not_required') return '£50 payable after acceptance'
  const labels: Record<string,string> = {not_required:'No payment required',awaiting_payment:'Awaiting payment',paid:'Paid',failed:'Payment failed',expired:'Checkout expired',cancelled:'Cancelled'}
  return labels[state] || state.replaceAll('_',' ')
}
