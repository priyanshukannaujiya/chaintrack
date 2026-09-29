import uuid
import random
import asyncio

class LogisticsService:
    @staticmethod
    async def get_tracking_info(shipment_id: uuid.UUID):
        # Simulate network latency to a third-party logistics API
        await asyncio.sleep(0.8)
        
        statuses = [
            "Manifest Received",
            "In Transit to Sort Facility", 
            "Customs Clearance", 
            "Out for Delivery", 
            "Delivered"
        ]
        
        return {
            "tracking_number": f"TRK-{str(shipment_id)[:8].upper()}",
            "carrier": random.choice(["FedEx", "DHL", "UPS", "Maersk"]),
            "current_status": random.choice(statuses),
            "estimated_delivery": "2024-12-01T12:00:00Z",
            "last_updated": "2024-11-15T08:30:00Z"
        }
