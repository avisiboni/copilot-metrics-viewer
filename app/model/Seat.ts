export class Seat {
    login: string;
    id: number;
    team: string;
    created_at: string;
    last_activity_at: string;
    last_activity_editor: string;
    plan_type: string;
    /** Organization directory email when enriched (GraphQL / SAML). */
    email?: string | null;
    /** Organization directory display name when enriched. */
    name?: string | null;

    constructor(data: any) {
        this.login = data.assignee ? data.assignee.login : (data.login || 'deprecated');
        this.id = data.assignee ? data.assignee.id : (data.id || 0);
        this.team = data.assigning_team ? data.assigning_team.name : (data.team || '');
        this.created_at = data.created_at;
        this.last_activity_at = data.last_activity_at;
        this.last_activity_editor = data.last_activity_editor;
        this.plan_type = data.plan_type;
        this.email = data.email ?? data.assignee?.email ?? null;
        this.name = data.name ?? data.assignee?.name ?? null;
    }
}

export class TotalSeats {
    total_seats: number;
    seats: Seat[];

    constructor(data: any) {
        this.total_seats = data.total_seats;
        this.seats = data.seats.map((seat: any) => new Seat(seat));
    }
}