// Reference logic to add to Level_Up_Portal after the new repository is live.
// Adapt the variable names to the portal's existing component.
const CONFIDENCE_CHECKPOINT_URL =
  'https://pinalworkforce1-del.github.io/Confidence_Checkpoint/';

export function resolveLevelUpPath(progressRows) {
  const progress = Object.fromEntries(
    progressRows.map((row) => [row.module_id, row])
  );

  if (!progress.discovery?.is_complete) {
    return { moduleId: 'discovery', label: 'Discovery available' };
  }

  if (!progress['resume-district']?.is_complete) {
    return { moduleId: 'resume-district', label: 'Resume District unlocked' };
  }

  if (!progress['confidence-checkpoint']?.is_complete) {
    return {
      moduleId: 'confidence-checkpoint',
      label: 'Confidence Checkpoint unlocked',
      href: CONFIDENCE_CHECKPOINT_URL,
    };
  }

  return { moduleId: 'interview-arena', label: 'Interview Arena unlocked' };
}
