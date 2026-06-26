import emailjs from "emailjs-com";
import { useState } from "react";

const Contact = () => {
  const [mailData, setMailData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const { name, email, message } = mailData;
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const onChange = (e) =>
    setMailData({ ...mailData, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    if (name.length === 0 || email.length === 0 || message.length === 0) {
      setError(true);
      clearError();
    } else {
      // https://www.emailjs.com/
      const templateParams = {
        to_email: process.env.NEXT_PUBLIC_EMAILJS_TO_EMAIL,
        from_name: name,
        name: name,
        email: email,
        message: message,
      };
      emailjs
        .send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
          templateParams,
          process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        )
        .then(
          (response) => {
            setSuccess(true);
            setError(null);
            setMailData({ name: "", email: "", message: "" });
            clearSuccess();
          },
          (err) => {
            setError(true);
            setSuccess(false);
            console.log(err.text);
            clearError();
          },
        );
    }
  };
  const clearError = () => {
    setTimeout(() => {
      setError(null);
    }, 3000);
  };
  const clearSuccess = () => {
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };
  return (
    <div className="devman_tm_section" id="contact">
      <div className="devman_tm_contact">
        <div className="container">
          <div className="contact_inner">
            <div className="devman_tm_main_title" data-text-align="left">
              <span>{`Don't`} be shy</span>
              <h3>Drop Me a Line</h3>
            </div>
            <div className="in">
              <div className="left wow fadeInLeft" data-wow-duration="1s">
                <div className="fields">
                  <form
                    className="contact_form"
                    id="contact_form"
                    autoComplete="off"
                    onSubmit={(e) => onSubmit(e)}
                  >
                    <div
                      className="returnmessage"
                      data-success="Your message has been received, We will contact you soon."
                    />
                    {error && (
                      <div
                        className="empty_notice"
                        style={{ display: "block" }}
                      >
                        <span style={{ color: "#e74c3c", fontWeight: "600" }}>
                          ❌ Please Fill Required Fields
                        </span>
                      </div>
                    )}
                    {success && (
                      <div
                        className="returnmessage"
                        style={{
                          display: "block",
                          backgroundColor: "#27ae60",
                          padding: "15px",
                          borderRadius: "5px",
                          color: "white",
                          marginBottom: "20px",
                        }}
                      >
                        <span style={{ fontWeight: "600" }}>
                          ✅ Email sent successfully! Thank you for reaching
                          out. I will get back to you soon.
                        </span>
                      </div>
                    )}
                    <div className="first">
                      <ul>
                        <li>
                          <input
                            id="name"
                            name="name"
                            onChange={(e) => onChange(e)}
                            value={name}
                            type="text"
                            placeholder="Name"
                          />
                        </li>
                        <li>
                          <input
                            id="email"
                            type="text"
                            name="email"
                            onChange={(e) => onChange(e)}
                            value={email}
                            placeholder="Email"
                          />
                        </li>
                      </ul>
                    </div>
                    <div className="last">
                      <textarea
                        id="message"
                        placeholder="Message"
                        name="message"
                        onChange={(e) => onChange(e)}
                        value={message}
                      />
                    </div>
                    <div className="devman_tm_button" data-position="left">
                      <input type="submit" value="Submit Message" />
                    </div>
                    {/* If you want to change mail address to yours, please open modal.php and go to line 4 */}
                  </form>
                </div>
              </div>
              <div className="right wow fadeInRight" data-wow-duration="1s">
                <ul>
                  <li>
                    <div className="list_inner">
                      <div className="icon">
                        <i className="icon-location orangeText" />
                      </div>
                      <div className="short">
                        <h3>Address</h3>
                        <span>
                          Saulėtekio al. 11, LT-10223 Vilnius, Lithuania
                        </span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="list_inner">
                      <div className="icon">
                        <i className="icon-mail-1 greenText" />
                      </div>
                      <div className="short">
                        <h3>Email</h3>
                        <span>
                          <a href="mailto:shashikanth033@gmail.com">
                            shashikanth033@gmail.com
                          </a>
                        </span>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="list_inner">
                      <div className="icon">
                        <i className="icon-phone purpleText" />
                      </div>
                      <div className="short">
                        <h3>Phone</h3>
                        <span>+91 8123192799</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="shape moving_effect"
              data-direction="y"
              data-reverse="yes"
            />
            <div
              className="shape_2 moving_effect"
              data-direction="y"
              data-reverse="yes"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;
