import React from "react";

function Footer() {
    return (
        <footer>
            <div className="flex row center between">
                <img src="keys.png" alt="" height={'50px'} style={{ width: '120px' }} />
                <section>
                    <h4 className="secondary helvetica">Move tiles in grid</h4>
                    <h4 className="secondary helvetica">to order them from <em className="primary">1 to 15.</em></h4>
                </section>
            </div>

            <section>
                <p className="primary helvetica">Made with <em className="red">❤️</em> by kai</p>
                <p className="primary helvetica">This project is open source, visit the <a className="weight bold" href="google.com">repo.</a></p>
            </section>

            <div className="gap halfrem flex row center">
                <p>GI</p>
                <p>IN</p>
                <p>TW</p>
            </div>
        </footer>
    );
}

export default Footer;
export {Footer}