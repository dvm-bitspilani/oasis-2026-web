import "../styles/About.module.scss";

const About = () => {
  return (
    <section className="about">
      <div className="about__content">
        <span className="about__label">ABOUT US</span>

        <h1>
          We turn ideas into
          <span> experiences.</span>
        </h1>

        <p>
          We are a creative team driven by curiosity, technology, and
          imagination. We love building things that look great, feel unique,
          and leave a lasting impression.
        </p>

        <div className="about__stats">
          <div>
            <strong>20+</strong>
            <span>Projects</span>
          </div>

          <div>
            <strong>10+</strong>
            <span>Creators</span>
          </div>

          <div>
            <strong>5</strong>
            <span>Years of Ideas</span>
          </div>
        </div>
      </div>

      <div className="about__visual">
        <div className="circle circle--one" />
        <div className="circle circle--two" />
        <div className="circle circle--three" />
        <span>CREATE</span>
      </div>
    </section>
  );
};

export default About;