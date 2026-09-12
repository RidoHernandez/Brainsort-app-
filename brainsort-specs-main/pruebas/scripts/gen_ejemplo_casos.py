"""Genera el diseno de casos de prueba BrainSort y su copia de ejemplo."""

from generate_brainsort_testing_docs import EXAMPLE_DIR, OUT_DIR, build_cases


if __name__ == "__main__":
    build_cases(OUT_DIR / "3.2-Casos-de-Prueba-BrainSort.xlsx")
    build_cases(EXAMPLE_DIR / "3.2-Casos-de-Prueba-EJEMPLO.xlsx")
    print("OK: casos de prueba generados")
