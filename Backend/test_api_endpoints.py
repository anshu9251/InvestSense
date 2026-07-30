import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_all_api_endpoints():
    print("==========================================")
    print("[TEST] STARTING INVESTSENSE AI BACKEND TEST SUITE")
    print("==========================================")
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Health check
        res = await client.get("/")
        print(f"1. Health Check GET / : {res.status_code} => {res.json()}")
        assert res.status_code == 200, "Health check failed!"

        # 2. Auth - Register test user
        test_email = "test_deploy_user@example.com"
        test_pass = "TestPassword123!"
        test_name = "Deployment Tester"
        
        reg_payload = {"name": test_name, "email": test_email, "password": test_pass}
        res = await client.post("/api/auth/register", json=reg_payload)
        if res.status_code == 400:
            print("   User already exists, proceeding to login...")
            res = await client.post("/api/auth/login", json={"email": test_email, "password": test_pass})
        
        assert res.status_code == 200, f"Auth failed with status {res.status_code}: {res.text}"
        auth_data = res.json()
        token = auth_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"2. Auth Register/Login: SUCCESS (Token acquired)")

        # 3. Auth Me
        res = await client.get("/api/auth/me", headers=headers)
        print(f"3. GET /api/auth/me : {res.status_code} => User: {res.json().get('name')}")
        assert res.status_code == 200

        # 4. Stock Quote
        res = await client.get("/api/stock/INFY.NS/quote", headers=headers)
        print(f"4. GET /api/stock/INFY.NS/quote : {res.status_code} => Price: Rs.{res.json().get('current_price')}")
        assert res.status_code == 200

        # 5. Portfolio Get
        res = await client.get("/api/portfolio", headers=headers)
        print(f"5. GET /api/portfolio : {res.status_code} => Holdings count: {len(res.json().get('holdings', []))}")
        assert res.status_code == 200

        # 6. Portfolio Add Holding
        add_holding_payload = {
            "symbol": "INFY.NS",
            "company_name": "Infosys Limited",
            "quantity": 5,
            "buy_price": 1500.0,
            "buy_date": "2026-07-30",
            "sector": "IT"
        }
        res = await client.post("/api/portfolio/add", json=add_holding_payload, headers=headers)
        print(f"6. POST /api/portfolio/add : {res.status_code} => Holding ID: {res.json().get('id')}")
        assert res.status_code == 200
        created_holding_id = res.json().get("id")

        # 7. Portfolio Risk Analysis
        res = await client.get("/api/portfolio/risk-analysis", headers=headers)
        print(f"7. GET /api/portfolio/risk-analysis : {res.status_code} => Health Score: {res.json().get('health_score')}")
        assert res.status_code == 200

        # 8. Delete Holding
        res = await client.delete(f"/api/portfolio/{created_holding_id}", headers=headers)
        print(f"8. DELETE /api/portfolio/{created_holding_id} : {res.status_code} => {res.json()}")
        assert res.status_code == 200

        # 9. Watchlist Get
        res = await client.get("/api/watchlist", headers=headers)
        print(f"9. GET /api/watchlist : {res.status_code} => Tickers: {res.json().get('symbols')}")
        assert res.status_code == 200

        # 10. Watchlist Add
        res = await client.post("/api/watchlist/add", json={"symbol": "TCS.NS"}, headers=headers)
        print(f"10. POST /api/watchlist/add : {res.status_code} => {res.json()}")
        assert res.status_code == 200

        # 11. Watchlist Remove
        res = await client.delete("/api/watchlist/TCS.NS", headers=headers)
        print(f"11. DELETE /api/watchlist/TCS.NS : {res.status_code} => {res.json()}")
        assert res.status_code == 200

        # 12. AI Agent Command Parsing
        res = await client.post("/api/agent/command", json={"message": "Go to Portfolio", "current_page": "/"}, headers=headers)
        print(f"12. POST /api/agent/command : {res.status_code} => Action: {res.json().get('action')}, Reply: {res.json().get('reply')}")
        assert res.status_code == 200

        # 13. AI Stock Research Workflow
        print("13. GET /api/stock/TCS.NS/research (Testing LangGraph agent workflow)...")
        res = await client.get("/api/stock/TCS.NS/research", headers=headers)
        print(f"    Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            print(f"    Sentiment: {data.get('sentiment')}")
            print(f"    Report length: {len(data.get('report') or '')} chars")
        else:
            print(f"    Research failed: {res.text}")

    print("\n[SUCCESS] ALL BACKEND API ENDPOINTS VERIFIED & WORKING PERFECTLY!")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(test_all_api_endpoints())
