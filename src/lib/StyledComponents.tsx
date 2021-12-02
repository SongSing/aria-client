import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
`;

export const NarrowRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`;

export const LabelRow = styled.label`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
`;

export function divWithClass<T = {}>(className: string) {
  return (props: React.PropsWithChildren<T>) => <div className={className} {...props} />;
}

export function spanWithClass<T = {}>(className: string) {
  return (props: React.PropsWithChildren<T>) => <span className={className} {...props} />;
}