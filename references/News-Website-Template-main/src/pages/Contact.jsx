export default function Contact() {
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
                              <h1>Contact With Us</h1>
                              <ul>
                                  <li>
                                      <a href="/index-2">Home</a> -</li>
                                  <li>Contact</li>
                              </ul>
                          </div>
                      </div>
                  </section>
                  {/* Breadcrumb Area End Here */}
                  {/* Contact Page Area Start Here */}
                  <section className="bg-body section-space-less30">
                      <div className="container">
                          <div className="row">
                              <div className="col-lg-8 col-md-12 mb-30">
                                  <div className="topic-border color-cod-gray mb-30">
                                      <div className="topic-box-lg color-cod-gray">About Us</div>
                                  </div>
                                  <h2 className="title-semibold-dark size-xl">Our Customer Support Representatives Are Ready To Help You 24/7, 365 Days a Year!</h2>
                                  <p className="size-lg mb-40">Esimply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
                                      standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
                                      scrambled it to make a type specimen book.</p>
                                  <div className="google-map-area mb-50">
                                      <div id="googleMap" style={{ width: "100%", height: "400px" }}></div>
                                  </div>
                                  <div className="topic-border color-cod-gray mb-30">
                                      <div className="topic-box-lg color-cod-gray">Location Info</div>
                                  </div>
                                  <ul className="address-info">
                                      <li>
                                          <i className="fa fa-map-marker" aria-hidden="true"></i>29 Street, Melbourne City, Australia # 34 Road, House #10.</li>
                                      <li>
                                          <i className="fa fa-phone" aria-hidden="true"></i>+ 9850678910</li>
                                      <li>
                                          <i className="fa fa-envelope-o" aria-hidden="true"></i>infoBizGrowth Africa.com</li>
                                      <li>
                                          <i className="fa fa-fax" aria-hidden="true"></i>+ 9850678910</li>
                                  </ul>
                                  <div className="topic-border color-cod-gray mb-30">
                                      <div className="topic-box-lg color-cod-gray">Send Us Message</div>
                                  </div>
                                  <form id="contact-form" className="contact-form">
                                      <fieldset>
                                          <div className="row">
                                              <div className="col-md-6 col-sm-12">
                                                  <div className="form-group">
                                                      <input type="text" placeholder="Name" className="form-control" name="name" id="form-subject" data-error="Name field is required"
                                                          required="" />
                                                      <div className="help-block with-errors"></div>
                                                  </div>
                                              </div>
                                              <div className="col-md-6 col-sm-12">
                                                  <div className="form-group">
                                                      <input type="email" placeholder="Your E-mail" className="form-control" name="email" id="form-email" data-error="Email field is required"
                                                          required="" />
                                                      <div className="help-block with-errors"></div>
                                                  </div>
                                              </div>
                                              <div className="col-12">
                                                  <div className="form-group">
                                                      <textarea placeholder="Message" className="textarea form-control" name="message" id="form-message" rows="7" cols="20" data-error="Message field is required"
                                                          required=""></textarea>
                                                      <div className="help-block with-errors"></div>
                                                  </div>
                                              </div>
                                              <div className="col-lg-4 col-md-4 col-sm-6 col-sm-12">
                                                  <div className="form-group mb-none">
                                                      <button type="submit" className="btn-ftg-ptp-56 disabled">Send Message</button>
                                                  </div>
                                              </div>
                                              <div className="col-lg-8 col-md-8 col-sm-6 col-sm-12">
                                                  <div className="form-response"></div>
                                              </div>
                                          </div>
                                      </fieldset>
                                  </form>
      
                              </div>
                          </div>
                      </div>
                  </section>
                  {/* Contact Page Area End Here */}
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
              
              {/* Google Map js */}
              
              {/* Validator js */}
              
              {/* Ticker Js */}
              
              {/* Custom Js */}
    </>
  );
}
