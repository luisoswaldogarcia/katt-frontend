Feature: Configuración Operativa
  Como usuario administrador de Katt
  Quiero configurar los aspectos operativos del sistema
  Para personalizar marca, módulos, y flujos de trabajo

  Background:
    Given que he iniciado sesión
    When navego a "/settings"
    And espero a que cargue la configuración
    And presiono el botón "Operativo"

  Scenario: Ver sección de Marca
    Then debo ver "Marca"
    And debo ver "Katt"

  Scenario: Ver sección de nombres de módulos
    Then debo ver "Nombres de módulos"
    And debo ver "Cliente"

  Scenario: Ver sección de campos personalizados
    Then debo ver "Campos personalizados"
    And debo ver los botones de módulo "Cliente"
    And debo ver los botones de módulo "Usuario"

  Scenario: Ver sección de categorías de inventario
    Then debo ver "Categorías de inventario"

  Scenario: Ver sección de columnas del tablero
    Then debo ver "Columnas del tablero"

  Scenario: Ver sección de columnas visibles en tareas
    Then debo ver "Columnas visibles en tabla de tareas"

  Scenario: Ver sección de tipos de tarea
    Then debo ver "Tipos de tarea"
