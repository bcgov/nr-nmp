import { render, screen, queryByAttribute } from '@testing-library/react';
import Modal from './Modal';

const getById = queryByAttribute.bind(null, 'id');

describe('Modal tests', () => {
  test('Footer div only renders when footer is given', () => {
    const dom1 = render(
      <Modal
        isVisible
        title="Test"
        onClose={() => {}}
      >
        <span>Hi</span>
      </Modal>,
    );
    const elem1 = getById(dom1.container, 'footer');
    expect(elem1).toBeNull();

    const dom2 = render(
      <Modal
        isVisible
        title="Test"
        onClose={() => {}}
        footer={<span>Ha</span>}
      >
        <span>Hi</span>
      </Modal>,
    );
    const elem2 = getById(dom2.container, 'footer');
    expect(elem2).not.toBeNull();
  });

  test('OnClose called on click', () => {
    const onClose = jest.fn(() => {});
    const { container } = render(
      <Modal
        isVisible
        title="Test"
        onClose={onClose}
      >
        <span>Hi</span>
      </Modal>,
    );
    const button = container.querySelector('button');
    button?.click();
    expect(onClose).toHaveBeenCalled();
  });

  test('Nothing displayed when isVisible is false', () => {
    render(
      <Modal
        isVisible={false}
        title="Test"
        onClose={() => {}}
      >
        <span>Hi</span>
      </Modal>,
    );
    const elem = screen.queryByText('Test');
    expect(elem).toBeNull();
  });
});
