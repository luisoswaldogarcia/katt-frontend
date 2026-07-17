module.exports = {
  default: {
    require: [
      'features/support/*.cjs',
      'features/step_definitions/*.cjs',
    ],
    format: [
      'progress-bar',
      'html:e2e-report/cucumber-report.html',
      'json:e2e-report/cucumber-report.json',
    ],
    publishQuiet: true,
    retry: 0,
    worldParameters: {
      baseUrl: 'https://d1fn2u7xetgmq1.cloudfront.net',
      email: 'admin@katt.app',
      password: 'Katt2026!',
    },
  },
}
