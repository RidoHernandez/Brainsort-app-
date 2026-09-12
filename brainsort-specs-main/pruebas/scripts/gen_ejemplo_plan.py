"""Genera el plan de pruebas BrainSort y su copia de ejemplo."""

from generate_brainsort_testing_docs import EXAMPLE_DIR, OUT_DIR, build_plan


if __name__ == "__main__":
    build_plan(OUT_DIR / "3.1-Plan-de-Pruebas-BrainSort.docx")
    build_plan(EXAMPLE_DIR / "3.1-Plan-de-Pruebas-EJEMPLO.docx")
    print("OK: plan de pruebas generado")
