"""Genera el informe de prueba BrainSort y su copia de ejemplo."""

from generate_brainsort_testing_docs import EXAMPLE_DIR, OUT_DIR, build_report


if __name__ == "__main__":
    build_report(OUT_DIR / "3.3-Informe-de-Prueba-BrainSort.xlsx")
    build_report(EXAMPLE_DIR / "3.3-Informe-de-Prueba-EJEMPLO.xlsx")
    print("OK: informe de prueba generado")
