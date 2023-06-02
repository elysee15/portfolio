const ContactMe = (props: any) => {
  return (
    <section id="contact-me" className="container h-screen flex items-center">
      <div className="w-full max-w-xl mx-auto">
        <h2 className="text-2xl md:text-4xl mb-8 font-medium text-center">
          Me <span className="text-secondary">contacter</span>
        </h2>
        <form action="#">
          <div className="w-full flex flex-col md:flex-row gap-4">
            <fieldset>
              <label htmlFor="fullName">Nom complet</label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                placeholder="John Doe"
                required
              />
            </fieldset>
            <fieldset>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="email@email.com"
                required
              />
            </fieldset>
          </div>
          <fieldset className="w-full">
            <label htmlFor="phone">
              Téléphone{" "}
              <span className="lowercase text-gray-500">(optionnel)</span>
            </label>
            <input
              type="tel"
              name="email"
              id="email"
              placeholder="06 00 00 00 00"
            />
          </fieldset>
          <div className="w-full flex gap-4">
            <fieldset className="w-full">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                cols={30}
                rows={8}
                className="w-full"
                placeholder="Écrivez votre message ici..."
                required
              ></textarea>
            </fieldset>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="uppercase rounded-lg text-xs bg-secondary py-5 text-white mt-4 min-w-[200px] hover:bg-secondary/90 transition-all duration-200 font-medium"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

ContactMe.displayName = "ContactMe";

export default ContactMe;
