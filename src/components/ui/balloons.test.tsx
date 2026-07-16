import { act, render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Balloons, type BalloonsHandle } from './balloons';

const balloonsMocks = vi.hoisted(() => ({
  balloons: vi.fn(),
  textBalloons: vi.fn(),
}));

vi.mock('balloons-js', () => ({
  balloons: balloonsMocks.balloons,
  textBalloons: balloonsMocks.textBalloons,
}));

describe('Balloons', () => {
  it('exposes only the animation handle through its ref', () => {
    const ref = createRef<BalloonsHandle>();
    const onLaunch = vi.fn();

    render(<Balloons ref={ref} type="text" text="Well done" onLaunch={onLaunch} />);

    act(() => ref.current?.launchAnimation());

    expect(balloonsMocks.textBalloons).toHaveBeenCalledWith([
      expect.objectContaining({ text: 'Well done', fontSize: 120, color: '#000000' }),
    ]);
    expect(onLaunch).toHaveBeenCalledTimes(1);
    expect(ref.current).toEqual({ launchAnimation: expect.any(Function) });
  });
});
