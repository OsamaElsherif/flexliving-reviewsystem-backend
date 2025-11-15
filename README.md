# flexliving-reviewsystem-backend

## Running the project locally

1. Clone the repository  
   ```bash
   git clone https://github.com/your-org/flexliving-reviewsystem-backend.git
   cd flexliving-reviewsystem-backend
   ```

2. Install dependencies  
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables  
     adjust `.env`  values to match your local setup (database URL, ports).

4. Start the database  
   Ensure sqlite (or the DB you configured) is running and the database specified in `.env` exists.

5. Run migrations / seeders 
   ```bash
   npm run migrate
   npm run seed
   ```

6. Launch the development server  
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. Verify  
   The API should now be reachable at `http://localhost:<PORT>` (default `3000`).

### Useful scripts
- `npm run build` – transpile TypeScript to JavaScript  
- `npm start` – start the compiled production build  
- `npm test` – run the test suite  
- `npm run lint` – lint the codebase
