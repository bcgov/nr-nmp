### Cypress Debugging Help

Cypress doesn't output very helpful debugging messages, so here is a list of common errors and what they mean.

- `data.map is not a function` **or** `data.filter is not a function`

This error is output if `cy.get({criteria})` doesn't find any elements that match the criteria.