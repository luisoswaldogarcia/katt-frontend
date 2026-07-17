Feature: Gestión de Tareas (Kanban)
  Como usuario de Katt
  Quiero gestionar tareas en el tablero Kanban
  Para organizar el trabajo del equipo

  Background:
    Given que he iniciado sesión

  Scenario: Crear una tarea en el tablero
    When navego a "/tareas"
    And presiono el botón flotante de nueva tarea
    And selecciono el tipo "General"
    And lleno el campo "Título" con un título único
    And presiono el botón "Crear tarea"
    Then la tarea debe crearse exitosamente

  Scenario: Eliminar una tarea
    When navego a "/tareas"
    And busco y selecciono la tarea creada
    And presiono el botón "Eliminar"
    Then la tarea debe eliminarse exitosamente
