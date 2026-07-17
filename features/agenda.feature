Feature: Gestión de Agenda (Citas)
  Como usuario de Katt
  Quiero agendar citas
  Para programar las consultas con pacientes

  Background:
    Given que he iniciado sesión

  Scenario: Crear una cita en la agenda
    When navego a "/agenda"
    And presiono el botón flotante de nueva cita
    And lleno el campo "fecha" con "2026-12-25"
    And lleno el campo "hora" con "10:00"
    And lleno el campo "motivo" con un motivo único
    And presiono el botón "Guardar"
    Then la cita debe crearse exitosamente
