export default function NotFound() {
  return (
    <>
      {/* Preloader Start Here */}
              
              {/* Preloader End Here */}
              <div id="wrapper" className="wrapper">
                  {/* Header handled globally */}
                  {/* Top ticker removed */}
                  {/* Weather/info strip removed */}
                  {/* Breadcrumb Area Start Here */}
                  <section className="breadcrumbs-area" style={{ backgroundImage: "url('/img/banner/breadcrumbs-banner.jpg')" }}>
                      <div className="container">
                          <div className="breadcrumbs-content">
                              <h1>404 Error Page</h1>
                              <ul>
                                  <li>
                                      <a href="/index-2">Home</a> -</li>
                                  <li>404</li>
                              </ul>
                          </div>
                      </div>
                  </section>
                  {/* Breadcrumb Area End Here */}
                  {/* 404 Error Page Area Start Here */}
                  <section className="bg-primary pt-100 pb-100">
                      <div className="container">
                          <div className="text-center">
                              <img src="/img/404.png" alt="404" className="img-fluid m-auto" loading="lazy" decoding="async"   />
                              <h2 className="title-regular-light size-c60 mb-60">Ooops... Error 404</h2>
                              <a href="/index-2" className="btn-gtf-ltl-64">Go To Home Page</a>
                          </div>
                      </div>
                  </section>
                  {/* 404 Error Page Area End Here */}
                  {/* Footer handled globally */}
                  {/* Modal Start*/}
                  <div className="modal fade" id="myModal" role="dialog">
                      <div className="modal-dialog">
                          <div className="modal-content">
                              <div className="modal-header">
                                  <button type="button" className="close" data-dismiss="modal">&times;</button>
                                  <div className="title-login-form">Login</div>
                              </div>
                              <div className="modal-body">
                                  <div className="login-form">
                                      <form>
                                          <label>Username or email address *</label>
                                          <input type="text" placeholder="Name or E-mail" />
                                          <label>Password *</label>
                                          <input type="password" placeholder="Password" />
                                          <div className="checkbox checkbox-primary">
                                              <input id="checkbox" type="checkbox" checked />
                                              <label htmlFor="checkbox">Remember Me</label>
                                          </div>
                                          <button type="submit" value="Login">Login</button>
                                          <button className="form-cancel" type="submit" value="">Cancel</button>
                                          <label className="lost-password">
                                              <a href="#">Lost your password?</a>
                                          </label>
                                      </form>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  {/* Modal End*/}
                  {/* Offcanvas Menu Start */}
                  <div id="offcanvas-body-wrapper" className="offcanvas-body-wrapper">
                      <div id="offcanvas-nav-close" className="offcanvas-nav-close offcanvas-menu-btn">
                          <a href="#" className="menu-times re-point">
                              <span></span>
                              <span></span>
                          </a>
                      </div>
                      <div className="offcanvas-main-body">
                          <ul id="accordion" className="offcanvas-nav panel-group">
                              <li className="panel panel-default">
                                  <div className="panel-heading">
                                      <a aria-expanded="false" className="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
                                          <i className="fa fa-home" aria-hidden="true"></i>Home Pages</a>
                                  </div>
                                  <div aria-expanded="false" id="collapseOne" role="tabpanel" className="panel-collapse collapse">
                                      <div className="panel-body">
                                          <ul className="offcanvas-sub-nav">
                                              <li>
                                                  <a href="/index-2">Home 1</a>
                                              </li>
                                              <li>
                                                  <a href="/index2">Home 2</a>
                                              </li>
                                              <li>
                                                  <a href="/index3">Home 3</a>
                                              </li>
                                              <li>
                                                  <a href="/index4">Home 4</a>
                                              </li>
                                              <li>
                                                  <a href="/index5">Home 5</a>
                                              </li>
                                              <li>
                                                  <a href="/index6">Home 6</a>
                                              </li>
                                              <li>
                                                  <a href="/index7">Home 7</a>
                                              </li>
                                          </ul>
                                      </div>
                                  </div>
                              </li>
                              <li>
                                  <a href="/author-post">
                                      <i className="fa fa-user" aria-hidden="true"></i>Author Post Page</a>
                              </li>
                              <li className="panel panel-default">
                                  <div className="panel-heading">
                                      <a aria-expanded="false" className="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">
                                          <i className="fa fa-file-text" aria-hidden="true"></i>Post Pages</a>
                                  </div>
                                  <div aria-expanded="false" id="collapseTwo" role="tabpanel" className="panel-collapse collapse">
                                      <div className="panel-body">
                                          <ul className="offcanvas-sub-nav">
                                              <li>
                                                  <a href="/post-style-1">Post Style 1</a>
                                              </li>
                                              <li>
                                                  <a href="/post-style-2">Post Style 2</a>
                                              </li>
                                              <li>
                                                  <a href="/post-style-3">Post Style 3</a>
                                              </li>
                                              <li>
                                                  <a href="/post-style-4">Post Style 4</a>
                                              </li>
                                          </ul>
                                      </div>
                                  </div>
                              </li>
                              <li className="panel panel-default">
                                  <div className="panel-heading">
                                      <a aria-expanded="false" className="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseThree">
                                          <i className="fa fa-info-circle" aria-hidden="true"></i>News Details Pages</a>
                                  </div>
                                  <div aria-expanded="false" id="collapseThree" role="tabpanel" className="panel-collapse collapse">
                                      <div className="panel-body">
                                          <ul className="offcanvas-sub-nav">
                                              <li>
                                                  <a href="/single-news-1">News Details 1</a>
                                              </li>
                                              <li>
                                                  <a href="/single-news-2">News Details 2</a>
                                              </li>
                                              <li>
                                                  <a href="/single-news-3">News Details 3</a>
                                              </li>
                                          </ul>
                                      </div>
                                  </div>
                              </li>
                              <li>
                                  <a href="/archive">
                                      <i className="fa fa-archive" aria-hidden="true"></i>Archive Page</a>
                              </li>
                              <li className="panel panel-default">
                                  <div className="panel-heading">
                                      <a aria-expanded="false" className="accordion-toggle collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapseFour">
                                          <i className="fa fa-picture-o" aria-hidden="true"></i>Gallery Pages</a>
                                  </div>
                                  <div aria-expanded="false" id="collapseFour" role="tabpanel" className="panel-collapse collapse">
                                      <div className="panel-body">
                                          <ul className="offcanvas-sub-nav">
                                              <li>
                                                  <a href="/gallery-style-1">Gallery Style 1</a>
                                              </li>
                                              <li>
                                                  <a href="/gallery-style-2">Gallery Style 2</a>
                                              </li>
                                          </ul>
                                      </div>
                                  </div>
                              </li>
                              <li>
                                  <a href="/404">
                                      <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>404 Error Page</a>
                              </li>
                              <li>
                                  <a href="/contact">
                                      <i className="fa fa-phone" aria-hidden="true"></i>Contact Page</a>
                              </li>
                          </ul>
                      </div>
                  </div>
                  {/* Offcanvas Menu End */}
              </div>
              {/* Wrapper End */}
              {/* jquery*/}
              
              {/* Plugins js */}
              
              {/* Popper js */}
              
              {/* Bootstrap js */}
              
              {/* WOW JS */}
              
              {/* Owl Cauosel JS */}
              
              {/* Meanmenu Js */}
              
              {/* Srollup js */}
              
              {/* jquery.counterup js */}
              
              
              {/* Isotope js */}
              
              {/* Magnific Popup */}
              
              {/* Ticker Js */}
              
              {/* Custom Js */}
    </>
  );
}
