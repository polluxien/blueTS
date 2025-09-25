export class Employee {
  constructor() {}
  // Public Properties
  public name: string = "";
  public age: number = 0;
  public isActive: boolean = true;

  // Private Properties
  private _salary: number = 0;
  private readonly _employeeId: string = "";
  private _credentials?: Map<string, string>;

  // Protected Properties
  protected department: string = "";

  // Static Properties
  static readonly COMPANY_NAME: string = "TechCorp GmbH";
  static employeeCount: number = 0;
  private static _nextEmployeeId: number = 1000;

  // Optional Properties
  public email?: string;
  public phoneNumber?: string;
  public middleName?: string;

  // Complex Types
  public skills: string[] = [];
  public projects: Set<string> = new Set();
  public metadata: Record<string, any> = {};
  public address?: {
    street: string;
    city: string;
    zipCode: string;
    country?: string;
  };

  // Union Types
  public contractType: "permanent" | "temporary" | "freelance" = "permanent";
  public workLocation?: "office" | "remote" | "hybrid";

  // Generic Properties
  public taskHistory: Array<{
    id: string;
    title: string;
    completed: boolean;
    dueDate?: Date;
  }> = [];

  // Function Properties
  public onStatusChange?: (oldStatus: boolean, newStatus: boolean) => void;
  public validator: (value: any) => boolean = () => true;
}
