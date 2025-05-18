describe('HomeView', () => {
  it('should render the AboutView component', () => {
    cy.visit('/')
    cy.get('h1').should('contain', 'This is an home page 1')
  })
})
