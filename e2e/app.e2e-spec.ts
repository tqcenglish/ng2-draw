import { Ng2DrawPage } from './app.po';

describe('ng2-draw App', () => {
  let page: Ng2DrawPage;

  beforeEach(() => {
    page = new Ng2DrawPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
