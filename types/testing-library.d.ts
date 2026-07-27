// jest.setup.js imports @testing-library/jest-dom at runtime, but because that
// setup file is plain JS it never reaches the TypeScript program, so `tsc
// --noEmit` reported every custom matcher (toBeInTheDocument, toHaveClass...)
// as missing. This pulls the matcher types in so the typecheck can be used as a
// real quality gate rather than something with 22 known errors in it.
import "@testing-library/jest-dom";
