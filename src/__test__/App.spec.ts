import App from '../App'

describe('sample', () => {
  let app: App
  beforeEach(() => {
    app = new App()
  })

  it('should exist', async () => {
    expect(app).toBeDefined()
  })
})
