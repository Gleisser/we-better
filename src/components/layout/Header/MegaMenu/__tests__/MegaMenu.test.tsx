import React from 'react';
import { render } from '@testing-library/react';
import MegaMenu from '../MegaMenu';

describe('MegaMenu', () => {
  it('renders without crashing', () => {
    render(<MegaMenu isOpen={false} onClose={() => {}} />);
  });
}); 