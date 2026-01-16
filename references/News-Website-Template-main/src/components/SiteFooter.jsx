export default function SiteFooter() {
  return (
    <footer className="bga-footer">
      <div className="container">
        <div className="bga-footer-grid">
          <div>
            <div className="bga-brand">
              <img src="/img/logos/bizgrowth2.png" alt="BizGrowth Africa" />
              <span>BizGrowth Africa</span>
            </div>
            <p>
              Curated business news, opportunities, tenders, tools, and community
              for African MSMEs.
            </p>
            <div className="bga-footer-contact">
              <div>
                <i className="fa fa-envelope" aria-hidden="true" />
                <span>hello@bizgrowth.africa</span>
              </div>
              <div>
                <i className="fa fa-phone" aria-hidden="true" />
                <span>+234 (0) 800 000 0000</span>
              </div>
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="/news-insights">News & Insights</a></li>
              <li><a href="/opportunities">Opportunities</a></li>
              <li><a href="/procurement-tenders">Procurement & Tenders</a></li>
              <li><a href="/tools-templates">Tools & Templates</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/community">Community</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Stay updated</h4>
            <form
              className="bga-footer-form"
              onSubmit={(event) => event.preventDefault()}
            >
              <input type="email" placeholder="Email address" required />
              <button type="submit">Subscribe</button>
            </form>
            <div className="bga-footer-social">
              <a href="#" aria-label="Twitter"><i className="fa fa-twitter" /></a>
              <a href="#" aria-label="LinkedIn"><i className="fa fa-linkedin" /></a>
              <a href="#" aria-label="Instagram"><i className="fa fa-instagram" /></a>
              <a href="#" aria-label="Facebook"><i className="fa fa-facebook" /></a>
            </div>
          </div>
        </div>
        <div className="bga-footer-bottom">
          © {new Date().getFullYear()} BizGrowth Africa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
