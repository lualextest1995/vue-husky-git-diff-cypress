describe('AboutView', () => {
  it('should render the AboutView component', () => {
    cy.visit('/about')
    cy.get('h1').should('contain', 'This is an about page 12')
  })
})
