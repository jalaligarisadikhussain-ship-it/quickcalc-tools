# QuickCalc — Scientific Calculator & Math Workbench

A free, mobile-friendly calculator with a standard keypad and **12 additional math workspaces**, inspired by the kinds of functions found on scientific calculators. This is not an official Casio product or a clone of a particular model.

## Calculator modes

1. **Scientific** — arithmetic, trigonometry and inverse functions, degree/radian toggle, logs, powers, roots, factorial, nCr/nPr, memory, Ans and history.
2. **Basic** — compact calculator keypad.
3. **Equations** — degree 1–4 polynomial roots (including complex roots), two- or three-variable linear systems, nonlinear numerical root approximations and quadratic inequalities.
4. **Matrices** — up to 5×5, addition, subtraction, multiplication, transpose, determinant, inverse and Ax=b.
5. **Vectors** — 2D/3D addition, subtraction, dot/cross (3D), magnitude, unit vector, projection and angle.
6. **Statistics** — one-variable mean, median, quartiles, sample/population variance and SD, plus paired linear regression.
7. **Distribution** — normal PDF/CDF/inverse CDF and binomial PMF/CDF.
8. **Complex** — rectangular arithmetic, conjugate, absolute value, argument and polar form.
9. **Table** — f(x) and optional g(x) with start/end/step, up to 151 rows.
10. **Calculus** — numerical derivative, definite integral (Simpson approximation), root solver.
11. **Base-N** — binary, octal, decimal and hexadecimal plus AND, OR, XOR and 32-bit NOT.
12. **Conversion** — length, mass, area, volume, speed, time, pressure, energy, temperature and angle.
13. **Number tools** — prime factors, GCD, LCM, factorial, nCr/nPr and proportional ratios.
14. **Spreadsheet** — 5×5 numeric grid, arithmetic formulas referencing cells A1–E5.

## Try it

- Scientific: type sin(30)+2^3, and press = (DEG mode gives 8.5).
- Equations: polynomial coefficients 1,-3,2 for x²−3x+2=0 (roots 1 and 2).
- Matrices: A = 2,1,1,3, 2 rows and 2 columns; det(A) = 5.
- Vectors: A=1,0,0, B=0,1,0; cross product = (0,0,1).
- Table: f(x) = x^2, start=0, end=5, step=1.
- Spreadsheet: enter 5 in A1 and =A1*3 in B1, then calculate.

## Files

- index.html: primary page, scientific calculator and existing advertising placements.
- advanced.css: responsive styling for advanced modes.
- advanced-core.js: math engine; expressions never run as JavaScript.
- advanced-ui.js: mode navigation, forms, result views and spreadsheet.

All calculations happen in the browser. Existing advertising scripts may make separate external requests.

## Limitations

JavaScript floating-point precision applies. Roots, differentiation, integration and probability calculations can be approximate. Matrices are at most 5×5; spreadsheet is at most 5×5. Model-specific Casio hardware features, QR transfer, programmable memory and specialized catalog menus are not included. Verify results used in important engineering or financial decisions.

Not affiliated with or endorsed by Casio.
