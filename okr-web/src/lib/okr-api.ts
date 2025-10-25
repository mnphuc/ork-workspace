import { apiFetch } from './api';

export async function duplicateObjective(id: string) {
  return apiFetch(`/objectives/${id}/duplicate`, {
    method: 'POST'
  });
}

export async function duplicateKeyResult(id: string) {
  return apiFetch(`/key-results/${id}/duplicate`, {
    method: 'POST'
  });
}

export async function moveObjective(id: string, teamId?: string, workspaceId?: string) {
  return apiFetch(`/objectives/${id}/move`, {
    method: 'PATCH',
    body: JSON.stringify({
      team_id: teamId,
      workspace_id: workspaceId
    })
  });
}

export async function deleteObjective(id: string) {
  return apiFetch(`/objectives/${id}`, {
    method: 'DELETE'
  });
}

export async function deleteKeyResult(id: string) {
  return apiFetch(`/key-results/${id}`, {
    method: 'DELETE'
  });
}
