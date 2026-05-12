import { h, render } from 'preact';

import type { Sense, WordResult } from '../../background/search-result';
import { html } from '../../utils/builder';

import type { NamePreview } from '../query';

import { WordTable } from './Words/WordTable';
import { PopupOptionsProvider } from './options-context';
import type { ShowPopupOptions } from './show-popup';

export function renderWordEntries({
  entries,
  matchLen,
  more,
  namePreview,
  options,
  title,
}: {
  entries: Array<WordResult>;
  matchLen: number;
  more: boolean;
  namePreview: NamePreview | undefined;
  options: ShowPopupOptions;
  title: string | undefined;
}): HTMLElement {
  const containerElement = html('div', { class: 'entry-data' });
  const filteredEntries = getVisibleWordEntries(entries);

  render(
    h(
      PopupOptionsProvider,
      { ...options },
      h(WordTable, {
        entries: filteredEntries,
        matchLen,
        more,
        namePreview,
        title,
        meta: options.meta,
        config: {
          readingOnly: !options.showDefinitions,
          fx: options.fxData,
          fontSize: options.fontSize || 'normal',
          ...options,
        },
        copyState: options.copyState,
        onStartCopy: options.onStartCopy,
      })
    ),
    containerElement
  );

  return containerElement;
}

export function getVisibleWordEntries(
  entries: Array<WordResult>
): Array<WordResult> {
  return entries
    .map(removeArchaicSenses)
    .filter((entry) => entry.s.some((sense) => sense.match));
}

const archaicMiscTags = new Set(['arch', 'obs', 'obsc']);
const archaicPosTags = new Set([
  'adj-kari',
  'adj-ku',
  'adj-nari',
  'adj-shiku',
  'v2a-s',
  'v2b-k',
  'v2b-s',
  'v2d-k',
  'v2d-s',
  'v2g-k',
  'v2g-s',
  'v2h-k',
  'v2h-s',
  'v2k-k',
  'v2k-s',
  'v2m-k',
  'v2m-s',
  'v2n-s',
  'v2r-k',
  'v2r-s',
  'v2s-s',
  'v2t-k',
  'v2t-s',
  'v2w-s',
  'v2y-k',
  'v2y-s',
  'v2z-s',
  'v4b',
  'v4g',
  'v4h',
  'v4k',
  'v4m',
  'v4n',
  'v4r',
  'v4s',
  'v4t',
]);

function removeArchaicSenses(entry: WordResult): WordResult {
  return { ...entry, s: entry.s.filter((sense) => !isArchaicSense(sense)) };
}

function isArchaicSense(sense: Sense): boolean {
  return (
    sense.misc?.some((tag) => archaicMiscTags.has(tag)) ||
    sense.pos?.some((tag) => archaicPosTags.has(tag)) ||
    false
  );
}
